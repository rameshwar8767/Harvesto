import apiClient from './client';

export const addressApi = {
    getAddresses: () => apiClient.get('/api/address/list'),
    addAddress: (data) => apiClient.post('/api/address/add', data),
    deleteAddress: (id) => apiClient.delete(`/api/address/${id}`),
};

export default addressApi;

