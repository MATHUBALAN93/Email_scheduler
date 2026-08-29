import api from './api';
import { Sender } from '../types';

export const senderService = {
  async getSenders(): Promise<Sender[]> {
    const response = await api.get('/api/senders');
    return response.data;
  },

  async createSender(data: {
    email: string;
    smtpHost: string;
    smtpPort: number;
    smtpUser: string;
    smtpPassword: string;
  }): Promise<Sender> {
    const response = await api.post('/api/senders', data);
    return response.data;
  },

  async deleteSender(id: string): Promise<void> {
    await api.delete(`/api/senders/${id}`);
  },
};
