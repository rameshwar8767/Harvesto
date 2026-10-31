import apiClient from './client';

export const productApi = {
    getAll: (params = {}) => {
        const query = new URLSearchParams();
        if (params.category) query.append('category', params.category);
        if (params.search) query.append('search', params.search);
        const qs = query.toString() ? `?${query.toString()}` : '';
        return apiClient.get(`/api/product/list${qs}`);
    },
    getById: (id) => apiClient.get(`/api/product/${id}`),
    create: (productData) => apiClient.post('/api/product/add', productData),
    update: (id, productData) => apiClient.put(`/api/product/update/${id}`, productData),
    toggleStock: (id, inStock) => apiClient.patch(`/api/product/stock/${id}`, { inStock }),
    delete: (id) => apiClient.delete(`/api/product/${id}`),
};

export default productApi;

