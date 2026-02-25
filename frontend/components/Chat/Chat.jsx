"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import chatService from '@/services/chat.service';
import echo from '@/lib/echo';
import { toast } from 'react-toastify';

const Chat = () => {
    const { user, token } = useAuth();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [conversationId, setConversationId] = useState(null);
    const [isOpen, setIsOpen] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const messagesEndRef = useRef(null);
    const typingTimeoutRef = useRef(null);

    const scrollToBottom = () => {
        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
        }, 50);
    };

    useEffect(() => {
        if (user && token && !user.is_admin) {
            const fetchInitialData = async () => {
                try {
                    // For users, we always check their specific conversation
                    const convs = await chatService.getConversations(token);
                    // Usually users only have one conversation
                    if (convs.length > 0) {
                        setConversationId(convs[0].id);
                        setUnreadCount(convs[0].unread_count || 0);
                        const initialMessages = await chatService.getMessages(convs[0].id, token);
                        setMessages(initialMessages);
                    }
                } catch (error) {
                    console.error("Failed to fetch messages:", error);
                }
            };
            fetchInitialData();
        }
    }, [user, token]);

    useEffect(() => {
        if (echo && conversationId && conversationId !== null && token) {
            // Update auth headers safely
            if (echo.connector.options.auth) {
                echo.connector.options.auth.headers.Authorization = `Bearer ${token}`;
            }

            const channel = echo.private(`chat.${conversationId}`)
                .listen('.MessageSent', (e) => {
                    // Guard: ensure event belongs to current conversation
                    if (e.conversation_id && e.conversation_id !== conversationId) return;

                    setMessages((prev) => {
                        // Prevent duplicates from optimistic updates
                        if (prev.find(msg => msg.id === e.id)) return prev;
                        return [...prev, e];
                    });

                    if (!isOpen) {
                        setUnreadCount(prev => prev + 1);
                        try { toast.info(e.message || 'New message'); } catch (err) { /* ignore */ }
                    } else {
                        // Mark as read immediately if arrived while open
                        chatService.markAsRead(conversationId, token).catch(console.error);
                    }
                })
                .listenForWhisper('typing', (e) => {
                    // Only show typing if this conversation is open
                    if (isOpen && (!e.conversation_id || e.conversation_id === conversationId)) {
                        setIsTyping(e.typing);
                        // Clear existing timeout
                        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
                        // Hide typing indicator after 3 seconds of inactivity
                        typingTimeoutRef.current = setTimeout(() => {
                            setIsTyping(false);
                        }, 3000);
                    }
                });

            return () => {
                try { echo.leaveChannel(`chat.${conversationId}`); } catch (err) { /* ignore */ }
            };
        }
    }, [conversationId, isOpen, token]);

    useEffect(() => {
        if (isOpen && conversationId && token && unreadCount > 0) {
            chatService.markAsRead(conversationId, token).catch(console.error);
            setUnreadCount(0);
        }
    }, [isOpen, conversationId, token, unreadCount]);

    useEffect(scrollToBottom, [messages]);

    const handleTyping = () => {
        if (echo && conversationId) {
            echo.private(`chat.${conversationId}`)
                .whisper('typing', {
                    typing: true
                });
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        // Optimistic update
        const tempId = 'temp_' + Date.now();
        const tempMessage = {
            id: tempId,
            message: newMessage,
            sender_id: user.id,
            conversation_id: conversationId,
            created_at: new Date().toISOString()
        };

        setMessages((prev) => [...prev, tempMessage]);
        const messageToSend = newMessage;
        setNewMessage('');

        if (echo && conversationId) {
            echo.private(`chat.${conversationId}`).whisper('typing', { typing: false });
        }

        try {
            const sentMessage = await chatService.sendMessage(messageToSend, conversationId, token);
            setMessages((prev) => {
                // Remove temp placeholder and any message that already has the server id (could have arrived via Echo)
                const cleaned = prev.filter(m => m.id !== tempId && m.id !== sentMessage.id);
                return [...cleaned, sentMessage];
            });
            
            // If it was the first message, update conversationId so we can start listening
            if (!conversationId) {
                setConversationId(sentMessage.conversation_id || sentMessage.id);
            }

        } catch (error) {
            console.error("Failed to send message:", error);
            // Revert message on failure
            setMessages((prev) => prev.filter(msg => msg.id !== tempId));
        }
    };

    if (!user || user.is_admin) return null;

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
            {isOpen && (
                <div className="w-80 h-[450px] bg-white border border-gray-200 rounded-2xl shadow-2xl flex flex-col overflow-hidden mb-4 transition-all duration-300 transform scale-100 origin-bottom-right">
                    <div className="bg-linear-to-r from-blue-600 to-indigo-700 text-white p-4 flex justify-between items-center shadow-md">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                            <span className="font-semibold tracking-wide">Live Support</span>
                        </div>
                        <button 
                            onClick={() => setIsOpen(false)}
                            className="hover:bg-white/20 rounded-full p-1 transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </button>
                    </div>

                    <div className="flex-1 p-4 overflow-y-auto bg-gray-50 scrollbar-thin scrollbar-thumb-gray-200">
                        {messages.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-gray-400 text-sm italic">
                                <p>How can we help you today?</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {messages.map((msg) => (
                                    <div key={msg.id} className={`flex ${msg.sender_id === user.id ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[85%] p-3 rounded-2xl text-sm shadow-sm ${
                                            msg.sender_id === user.id 
                                                ? 'bg-blue-600 text-white rounded-tr-none' 
                                                : 'bg-white text-gray-800 rounded-tl-none border border-gray-100'
                                        }`}>
                                            {msg.message}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        {isTyping && (
                            <div className="flex justify-start mb-2">
                                <div className="bg-gray-200 text-gray-500 text-[10px] px-3 py-1 rounded-full animate-pulse">
                                    Admin is typing...
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-gray-100 flex gap-2">
                        <input
                            type="text"
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
                            placeholder="Type a message..."
                            className="flex-1 border-gray-200 border rounded-full px-4 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                        />
                        <button 
                            type="submit" 
                            disabled={!newMessage.trim()}
                            className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md active:scale-95"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 rotate-90" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                            </svg>
                        </button>
                    </form>
                </div>
            )}

            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`relative w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 transform hover:scale-110 active:scale-90 ${
                    isOpen ? 'bg-gray-100 text-gray-600 rotate-90' : 'bg-blue-600 text-white'
                }`}
            >
                {unreadCount > 0 && !isOpen && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white animate-bounce">
                        {unreadCount}
                    </span>
                )}
                {isOpen ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                )}
            </button>
        </div>
    );
};

export default Chat;
