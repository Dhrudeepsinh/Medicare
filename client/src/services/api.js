import axios from 'axios';
import toast from 'react-hot-toast';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor — attach token if present
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('medicare_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle auth errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.message || error.message;

    if (status === 401) {
      // Token expired or invalid — clear and redirect
      localStorage.removeItem('medicare_token');
      delete api.defaults.headers.common['Authorization'];
      if (!window.location.pathname.includes('/login')) {
        toast.error('Session expired. Please log in again.');
        setTimeout(() => {
          window.location.href = '/login';
        }, 1500);
      }
    } else if (status === 403) {
      toast.error('Access denied.');
    } else if (status === 500) {
      toast.error('Server error. Please try again later.');
    }

    return Promise.reject({ message, status, data: error.response?.data });
  }
);

export default api;
