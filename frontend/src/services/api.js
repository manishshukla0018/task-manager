import axios from 'axios';
import { getStoredToken } from '../utils/authStorage';

/**
 * Dev: Vite proxies /api → localhost:5000 (see vite.config.js).
 * Prod: same origin as Express, or set VITE_API_URL to your API origin (no trailing slash).
 *
 * Auth: httpOnly cookie (preferred) + Authorization Bearer from sessionStorage when present
 * (fallback for hosts where the cookie is not attached to XHR).
 */
const apiOrigin = import.meta.env.VITE_API_URL
  ? String(import.meta.env.VITE_API_URL).replace(/\/$/, '')
  : '';

const api = axios.create({
  baseURL: apiOrigin || '/api',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const t = getStoredToken();
  if (t) {
    config.headers.Authorization = `Bearer ${t}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.response?.data?.errors?.[0]?.message ||
      'Something went wrong';
    return Promise.reject({ ...error, message });
  }
);

export default api;
