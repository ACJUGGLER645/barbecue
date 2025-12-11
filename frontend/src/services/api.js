import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_URL,
});

// Interceptor para añadir token JWT a todas las peticiones
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Auth Services
export const authService = {
    login: (email, password) => api.post('/auth/login', { email, password }),

    register: (formData) => api.post('/auth/register', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),

    getCurrentUser: () => api.get('/auth/me'),
};

// Admin Services
export const adminService = {
    getUsers: () => api.get('/admin/users'),
    approveUser: (id) => api.post(`/admin/users/${id}/approve`),
    disableUser: (id) => api.post(`/admin/users/${id}/disable`),
    deleteUser: (id) => api.delete(`/admin/users/${id}`),
    changeRole: (id, role) => api.put(`/admin/users/${id}/role`, { role }),
};

// File Service
export const getUploadUrl = (filename) => `${API_URL}/uploads/${filename}`;

export default api;
