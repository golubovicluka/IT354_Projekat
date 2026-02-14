import api from '@/lib/api';

export const scenarioService = {
    getAll: async () => {
        const response = await api.get('/scenarios');
        return response.data;
    },

    getById: async (id) => {
        const response = await api.get(`/scenarios/${id}`);
        return response.data;
    },

    create: async (data) => {
        const response = await api.post('/scenarios', data);
        return response.data;
    },

    update: async (id, data) => {
        const response = await api.put(`/scenarios/${id}`, data);
        return response.data;
    },

    delete: async (id) => {
        const response = await api.delete(`/scenarios/${id}`);
        return response.data;
    },
};
