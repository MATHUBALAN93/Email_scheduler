import api from './api';
import { User } from '../types';

const TOKEN_KEY = 'auth_token';

export const authService = {
  setToken(token: string) {
    localStorage.setItem(TOKEN_KEY, token);
  },

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },

  clearToken() {
    localStorage.removeItem(TOKEN_KEY);
  },

  async loginWithGoogle() {
    window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/auth/google`;
  },

  async loginWithEmail(email: string, password: string): Promise<{ token: string; user: User }> {
    const response = await api.post('/auth/login', { email, password });
    const { token, user } = response.data;
    this.setToken(token);
    return { token, user };
  },

  async register(name: string, email: string, password: string): Promise<{ token: string; user: User }> {
    const response = await api.post('/auth/register', { name, email, password });
    const { token, user } = response.data;
    this.setToken(token);
    return { token, user };
  },

  async getMe(): Promise<User> {
    const response = await api.get('/auth/me');
    return response.data;
  },

  async logout(): Promise<void> {
    await api.post('/auth/logout');
    this.clearToken();
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  },
};
