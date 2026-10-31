import apiClient from './client';

export const authApi = {
    // User Auth
    login: (credentials) => apiClient.post('/api/user/login', credentials),
    register: (userData) => apiClient.post('/api/user/register', userData),
    checkAuth: () => apiClient.get('/api/user/is-auth', { silent: true }),
    logout: () => apiClient.get('/api/user/logout'),

    // Seller Auth
    sellerLogin: (credentials) => apiClient.post('/api/seller/login', credentials),
    checkSellerAuth: () => apiClient.get('/api/seller/is-auth', { silent: true }),
    sellerLogout: () => apiClient.get('/api/seller/logout'),
};

export default authApi;

