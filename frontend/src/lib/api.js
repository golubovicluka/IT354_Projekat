import axios from 'axios';
import { clearStoredAuth, getStoredToken } from '@/lib/authStorage';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
let unauthorizedHandler = null;

export const setUnauthorizedHandler = (handler) => {
    unauthorizedHandler = typeof handler === 'function' ? handler : null;
};

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use((config) => {
    const token = getStoredToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        const isAuthEndpoint = error.config?.url?.includes('/auth/');
        if (error.response?.status === 401 && !isAuthEndpoint) {
            clearStoredAuth();
            if (unauthorizedHandler) {
                unauthorizedHandler(error);
            }
        }
        return Promise.reject(error);
    }
);

export default api;
