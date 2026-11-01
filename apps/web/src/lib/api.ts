import axios from 'axios';

const getBaseApiUrl = (): string => {
  if (process.env.NEXT_PUBLIC_API_URL) {
    const raw = process.env.NEXT_PUBLIC_API_URL;
    return raw.endsWith('/api/v1') ? raw : `${raw.replace(/\/+$/, '')}/api/v1`;
  }
  // In production browser environments where NEXT_PUBLIC_API_URL is omitted,
  // use relative '/api/v1' for same-origin Vercel deployment with zero CORS issues
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
    return '/api/v1';
  }
  // Local development default
  return 'http://localhost:5000/api/v1';
};

const API_URL = getBaseApiUrl();

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach access token
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('swap_access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshRes = await axios.post(
          `${API_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        if (refreshRes.data.success) {
          const newToken = refreshRes.data.data.accessToken;
          localStorage.setItem('swap_access_token', newToken);
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        }
      } catch (refreshErr) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('swap_access_token');
          localStorage.removeItem('swap_user');
        }
      }
    }
    return Promise.reject(error);
  }
);
