import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getAuthToken = () => {
  return localStorage.getItem('token');
};

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to every request
axiosInstance.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const adminAPI = {
  // Dashboard
  getDashboardStats: () => axiosInstance.get('/admin/dashboard/stats'),

  // Users Management
  getUsers: (page = 1, limit = 10) =>
    axiosInstance.get(`/admin/users?page=${page}&limit=${limit}`),
  updateUserRole: (userId, role) =>
    axiosInstance.put(`/admin/users/${userId}/role`, { role }),
  deleteUser: (userId) => axiosInstance.delete(`/admin/users/${userId}`),

  // Categories Management
  getAllCategories: () => axiosInstance.get('/categories'),
  getCategoryById: (categoryId) => axiosInstance.get(`/categories/${categoryId}`),
  createCategory: (categoryData) =>
    axiosInstance.post('/categories', categoryData),
  updateCategory: (categoryId, categoryData) =>
    axiosInstance.put(`/categories/${categoryId}`, categoryData),
  deleteCategory: (categoryId) =>
    axiosInstance.delete(`/categories/${categoryId}`),
};

export default axiosInstance;
