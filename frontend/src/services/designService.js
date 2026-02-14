import api from '@/lib/api';

export const designService = {
    getAll: async (params = {}) => {
        const response = await api.get('/designs', { params });
        return response.data;
    },

    getById: async (id) => {
        const response = await api.get(`/designs/${id}`);
        return response.data;
    },

    getDraft: async (scenarioId) => {
        const response = await api.get(`/designs/scenario/${scenarioId}/draft`);
        return response.data;
    },

    create: async (data) => {
        const response = await api.post('/designs', data);
        return response.data;
    },

    update: async (id, data) => {
        const response = await api.put(`/designs/${id}`, data);
        return response.data;
    },

    submit: async (id) => {
        const response = await api.patch(`/designs/${id}/submit`);
        return response.data;
    },

    getFeedback: async (designId) => {
        const response = await api.get(`/feedback/${designId}`);
        return response.data;
    },

    submitFeedback: async (data) => {
        const response = await api.post('/feedback', data);
        return response.data;
    },

    deleteFeedback: async (designId) => {
        const response = await api.delete(`/feedback/${designId}`);
        return response.data;
    },
};
