import api from './api.js';

export const authService = {
  login: (email, password) => api.post('/auth/login', { email, password }),

  signup: (data) => api.post('/auth/signup', data),

  logout: () => api.post('/auth/logout'),

  getMe: () => api.get('/auth/me'),
};
