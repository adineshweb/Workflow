import axios from 'axios';

let apiBase = import.meta.env.VITE_API_URL || '/api';

// Self-healing check: automatically append '/api' if a custom URL is provided but missing the path prefix
if (apiBase !== '/api' && !apiBase.endsWith('/api') && !apiBase.endsWith('/api/')) {
  apiBase = apiBase.replace(/\/$/, '') + '/api';
}

const axiosInstance = axios.create({
  baseURL: apiBase,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: Attach JWT token if present
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor: Handle expired tokens (401 Unauthorized)
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token and user storage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // If we are not already on the login page, redirect
      if (!window.location.pathname.endsWith('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
