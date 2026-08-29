import api from './api';
import { User } from '../types';

export const authService = {
  async loginWithGoogle() {
    window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/auth/google`;
  },

  async getMe(): Promise<User> {
    const response = await api.get('/auth/me');
    return response.data;
  },

  async logout(): Promise<void> {
    await api.post('/auth/logout');
  },
};
