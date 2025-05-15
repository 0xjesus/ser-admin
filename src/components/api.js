import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para añadir token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default {
  // Contactos
  getContacts: (params = {}) => apiClient.get('/admin/contacts', { params }),

  // Bookings
  getBookings: (params = {}) => apiClient.get('/admin/bookings', { params }),

  // Reportes
  downloadReport: (params = {}) => {
    window.location.href = `${API_URL}/admin/reports/download?${new URLSearchParams(params)}`;
  }
};
