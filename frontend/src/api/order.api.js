import apiClient from './client';

export const orderApi = {
    create: (orderData) => apiClient.post('/api/order/create', orderData),
    getUserOrders: () => apiClient.get('/api/order/user'),
    getSellerOrders: () => apiClient.get('/api/order/seller/list'),
    updateStatus: (id, status) => apiClient.patch(`/api/order/status/${id}`, { status }),
};

export default orderApi;
