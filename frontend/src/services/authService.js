import api from '@/lib/api';

export const authService = {
    login: async (email, password) => {
        const response = await api.post('/auth/login', { email, password });
        return response.data;
    },

    register: async (username, email, password) => {
        const response = await api.post('/auth/register', { username, email, password });
        return response.data;
    },
};
