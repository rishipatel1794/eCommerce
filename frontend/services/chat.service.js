import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';

const chatService = {
    getConversations: async (token) => {
        const response = await axios.get(`${API_URL}/chat/conversations`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    },
    getUsers: async (token) => {
        const response = await axios.get(`${API_URL}/chat/users`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    },
    getMessages: async (conversationId, token) => {
        const response = await axios.get(`${API_URL}/chat/messages/${conversationId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    },
    sendMessage: async (message, conversationId, token, userId = null) => {
        const response = await axios.post(`${API_URL}/chat/send`, {
            message,
            conversation_id: conversationId,
            user_id: userId
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    },
    markAsRead: async (conversationId, token) => {
        const response = await axios.post(`${API_URL}/chat/read/${conversationId}`, {}, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    }
};

export default chatService;
