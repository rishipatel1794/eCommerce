"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import chatService from '@/services/chat.service';
import echo from '@/lib/echo';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Search, Send, User, MessageSquare } from 'lucide-react';
import { toast } from 'react-toastify';

const AdminChatPage = () => {
    const { user, token } = useAuth();
    const [conversations, setConversations] = useState([]);
    const [users, setUsers] = useState([]);
    const [selectedChat, setSelectedChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);
    const typingTimeoutRef = useRef(null);

    const scrollToBottom = () => {
        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
        }, 50);
    };

    useEffect(() => {
        if (token) {
            fetchInitialData();
        }
    }, [token]);

    const fetchInitialData = async () => {
        try {
            const [convs, allUsers] = await Promise.all([
                chatService.getConversations(token),
                chatService.getUsers(token)
            ]);
            setConversations(convs);
            setUsers(allUsers);
        } catch (error) {
            console.error("Failed to fetch admin chat data:", error);
        }
    };

    useEffect(() => {
        if (echo && selectedChat && selectedChat.id && token) {
            // Update auth headers safely
            if (echo.connector.options.auth) {
                echo.connector.options.auth.headers.Authorization = `Bearer ${token}`;
            }

            const fetchMessages = async () => {
                try {
                    const history = await chatService.getMessages(selectedChat.id, token);
                    setMessages(history);
                    
                    // Mark as read when opened
                    chatService.markAsRead(selectedChat.id, token).catch(console.error);
                    setConversations(prev => prev.map(c => 
                        c.id === selectedChat.id ? { ...c, unread_count: 0 } : c
                    ));
                } catch (error) {
                    console.error("Failed to fetch messages:", error);
                }
            };

            fetchMessages();

            // Listen for new messages on this specific conversation
            // Recieve New messages for this conversation

            const channel = echo.private(`chat.${selectedChat.id}`)
                .listen('.MessageSent', (e) => {
                    // Guard: ensure this event is for the current conversation
                    if (e.conversation_id && e.conversation_id !== selectedChat.id) return;
                    console.log(e);
                    setMessages((prev) => {
                        if (prev.find(msg => msg.id === e.id)) return prev;
                        return [...prev, e];
                    });

                    // Mark as read immediately
                    chatService.markAsRead(selectedChat.id, token).catch(console.error);

                    // Update the last message in conversations list
                    setConversations(prev => prev.map(c => 
                        c.id === selectedChat.id ? { ...c, last_message: e, unread_count: 0 } : c
                    ));
                })
                .listenForWhisper('typing', (e) => {
                    // Only show typing for this conversation
                    if (e.conversation_id && e.conversation_id !== selectedChat.id) return;
                    setIsTyping(e.typing);
                    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
                    typingTimeoutRef.current = setTimeout(() => {
                        setIsTyping(false);
                    }, 3000);
                });

            return () => {
                if (echo) {
                    try { echo.leaveChannel(`chat.${selectedChat.id}`); } catch (err) { /* ignore */ }
                }
            };
        }
    }, [selectedChat, token]);

    // Admin-wide listener: receive MessageSent broadcasts for all conversations (used for toasts/unread when admin is not viewing that conversation)
    useEffect(() => {
        if (echo && token && user && user.is_admin) {
            if (echo.connector.options.auth) {
                echo.connector.options.auth.headers.Authorization = `Bearer ${token}`;
            }

            const adminChannel = echo.private('admin.chat')
                .listen('.MessageSent', (e) => {
                    // If message belongs to currently opened conversation, ignore here (handled above)
                    if (selectedChat && e.conversation_id && selectedChat.id === e.conversation_id) return;

                    // Update conversations list: increment unread for matching conversation
                    setConversations(prev => prev.map(c => 
                        c.id === e.conversation_id ? { ...c, last_message: e, unread_count: (c.unread_count || 0) + 1 } : c
                    ));

                    // Show toast notification for admin when not viewing that conversation
                    try { toast.info(e.message || 'New message'); } catch (err) { /* ignore */ }

                    // Desktop notification fallback
                    try {
                        if (typeof Notification !== 'undefined') {
                            if (Notification.permission === 'granted') {
                                new Notification('New message', { body: e.message });
                            } else if (Notification.permission !== 'denied') {
                                Notification.requestPermission().then(p => {
                                    if (p === 'granted') new Notification('New message', { body: e.message });
                                });
                            }
                        }
                    } catch (err) {
                        console.error('Notification error', err);
                    }
                });

            return () => {
                if (echo) try { echo.leaveChannel('admin.chat'); } catch (err) { /* ignore */ }
            };
        }
    }, [token, user, selectedChat]);

    useEffect(scrollToBottom, [messages]);

    const handleTyping = () => {
        if (echo && selectedChat && selectedChat.id) {
            echo.private(`chat.${selectedChat.id}`)
                .whisper('typing', {
                    typing: true
                });
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedChat) return;

        const tempId = 'temp_' + Date.now();
        const tempMessage = {
            id: tempId,
            message: newMessage,
            sender_id: user.id,
            conversation_id: selectedChat.id,
            created_at: new Date().toISOString()
        };

        setMessages((prev) => [...prev, tempMessage]);
        const messageToSend = newMessage;
        setNewMessage('');
        
        if (echo && selectedChat && selectedChat.id) {
            echo.private(`chat.${selectedChat.id}`).whisper('typing', { typing: false });
        }

        try {
            const sentMessage = await chatService.sendMessage(
                messageToSend, 
                selectedChat.id, 
                token, 
                selectedChat.isNew ? selectedChat.user.id : null
            );
            
            // If it was a new chat, update the selectedChat with real ID
            if (selectedChat.isNew) {
                setSelectedChat(prev => ({
                    ...prev,
                    id: sentMessage.conversation_id,
                    isNew: false
                }));
                fetchInitialData();
            }

            setMessages((prev) => {
                // Remove any existing message that has the same id as the sent message (could have arrived via Echo already)
                const cleaned = prev.filter(m => m.id !== tempId && m.id !== sentMessage.id);
                return [...cleaned, sentMessage];
            });
            
            // Update last message in the list
            setConversations(prev => prev.map(c => 
                c.id === (sentMessage.conversation_id || selectedChat.id) ? { ...c, last_message: sentMessage } : c
            ));
        } catch (error) {
            console.error("Failed to send message:", error);
            setMessages((prev) => prev.filter(msg => msg.id !== tempId));
        }
    };

    const startNewChat = async (targetUser) => {
        // Find if a conversation already exists for this user using multiple possible keys
        const findConversationByUser = (uId) => {
            return conversations.find(c =>
                c?.user?.id === uId ||
                c?.user_id === uId ||
                c?.participant_id === uId ||
                (Array.isArray(c?.users) && c.users.find(x => x.id === uId))
            );
        };

        const existing = findConversationByUser(targetUser.id);
        if (existing) {
            setSelectedChat({ ...existing });
            const msgs = await chatService.getMessages(existing.id, token).catch(() => []);
            setMessages(msgs);
        } else {
            // Create a temporary placeholder conversation per-user so UI remains distinct
            const tempId = `temp_user_${targetUser.id}`;
            // Ensure we don't add duplicates to conversations list
            setConversations(prev => {
                if (prev.find(p => p.id === tempId)) return prev;
                return [{ id: tempId, user: targetUser, last_message: null, unread_count: 0, isNew: true }, ...prev];
            });

            setSelectedChat({ id: null, tempId, user: targetUser, isNew: true });
            setMessages([]);
        }
    };

    // Filter users/conversations
    const filteredItems = users.filter(u =>
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <ProtectedRoute adminOnly={true}>
            <div className="flex h-[calc(100vh-64px)] bg-white overflow-hidden">
                {/* Sidebar */}
                <div className="w-1/3 border-r border-gray-200 flex flex-col bg-gray-50">
                    <div className="p-4 border-b bg-white">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Messages</h2>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <input 
                                type="text"
                                placeholder="Search users by name or email..."
                                className="w-full pl-10 pr-4 py-2 bg-gray-100 border-none rounded-lg text-sm focus:ring-2 focus:ring-blue-500 transition-all"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        {filteredItems.map((u) => {
                            const conv = conversations.find(c => c.user.id === u.id);
                            const isActive = selectedChat?.user?.id === u.id;
                            
                            return (
                                <div 
                                    key={u.id}
                                    onClick={() => startNewChat(u)}
                                    className={`p-4 cursor-pointer hover:bg-white transition-colors border-b border-gray-100 flex items-center justify-between ${isActive ? 'bg-white border-l-4 border-l-blue-600' : ''}`}
                                >
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold shrink-0">
                                            {u.name.charAt(0)}
                                        </div>
                                        <div className="overflow-hidden">
                                            <div className="font-semibold text-gray-900 truncate">{u.name}</div>
                                            <div className="text-xs text-gray-500 truncate">{u.email}</div>
                                            {conv?.last_message && (
                                                <div className="text-xs text-blue-600 mt-1 truncate font-medium">
                                                    {conv.last_message.message}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-1">
                                        <MessageSquare className="h-4 w-4 text-gray-300" />
                                        {conv?.unread_count > 0 && (
                                            <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                                                {conv.unread_count}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Main Chat Area */}
                <div className="flex-1 flex flex-col bg-white">
                    {selectedChat ? (
                        <>
                            {/* Chat Header */}
                            <div className="p-4 border-b flex items-center justify-between shadow-sm">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                                        {selectedChat.user.name.charAt(0)}
                                    </div>
                                    <div>
                                        <div className="font-bold text-gray-900">{selectedChat.user.name}</div>
                                        <div className="text-xs text-green-500 flex items-center gap-1">
                                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                                            Active Support Thread
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Messages Container */}
                            <div className="flex-1 p-6 overflow-y-auto bg-gray-50 space-y-4">
                                {messages.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-gray-400">
                                        <MessageSquare className="h-12 w-12 mb-2 opacity-20" />
                                        <p>No message history with this user.</p>
                                        <p className="text-sm">Start the conversation below.</p>
                                    </div>
                                ) : (
                                    messages.map((msg) => (
                                        <div key={msg.id} className={`flex ${msg.sender_id === user.id ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[70%] ${msg.sender_id === user.id ? 'bg-blue-600 text-white rounded-2xl rounded-tr-none' : 'bg-white text-gray-800 border border-gray-200 rounded-2xl rounded-tl-none'} p-3 shadow-sm`}>
                                                <div className="text-sm">{msg.message}</div>
                                                <div className={`text-[10px] mt-1 ${msg.sender_id === user.id ? 'text-blue-200' : 'text-gray-400'}`}>
                                                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                                {isTyping && (
                                    <div className="flex justify-start mb-2">
                                        <div className="bg-blue-100 text-blue-600 text-xs px-3 py-1 rounded-full animate-pulse border border-blue-200">
                                            User is typing...
                                        </div>
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Message Input */}
                            <form onSubmit={handleSendMessage} className="p-4 border-t bg-white">
                                <div className="flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2 focus-within:ring-2 focus-within:ring-blue-500 transition-all">
                                    <input 
                                        type="text"
                                        placeholder="Type your reply..."
                                        className="flex-1 bg-transparent border-none outline-none text-sm py-2"
                                        value={newMessage}
                                        onChange={(e) => {
                                            setNewMessage(e.target.value);
                                            handleTyping();
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && newMessage.trim()) {
                                                e.preventDefault();
                                                handleSendMessage(e);
                                            }
                                        }}
                                    />
                                    <button 
                                        type="submit"
                                        disabled={!newMessage.trim()}
                                        className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-md"
                                    >
                                        <Send className="h-4 w-4" />
                                    </button>
                                </div>
                            </form>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-gray-400 bg-gray-50">
                            <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                                <User className="h-10 w-10 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-600">Select a user to start chatting</h3>
                            <p className="max-w-xs text-center mt-2 text-sm">
                                You can view all users and their email addresses in the sidebar to initiate support.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </ProtectedRoute>
    );
};

export default AdminChatPage;
