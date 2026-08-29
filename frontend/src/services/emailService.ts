import api from './api';
import { Email, ScheduleCampaignRequest, PaginatedResponse } from '../types';

export const emailService = {
  async scheduleCampaign(data: ScheduleCampaignRequest) {
    const response = await api.post('/api/emails/schedule', data);
    return response.data;
  },

  async getScheduledEmails(page: number = 1, limit: number = 10): Promise<PaginatedResponse<Email>> {
    const response = await api.get('/api/emails/scheduled', { params: { page, limit } });
    return response.data;
  },

  async getSentEmails(page: number = 1, limit: number = 10): Promise<PaginatedResponse<Email>> {
    const response = await api.get('/api/emails/sent', { params: { page, limit } });
    return response.data;
  },

  async getEmailById(id: string): Promise<Email> {
    const response = await api.get(`/api/emails/${id}`);
    return response.data;
  },

  async searchEmails(query: string, page: number = 1, limit: number = 10): Promise<PaginatedResponse<Email>> {
    const response = await api.get('/api/emails/search', { params: { q: query, page, limit } });
    return response.data;
  },
};
