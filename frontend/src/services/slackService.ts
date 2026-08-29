import api from './api';

export const slackService = {
  async connect(): Promise<{ authUrl: string }> {
    const response = await api.get('/api/slack/connect');
    return response.data;
  },

  async getStatus(): Promise<{ connected: boolean; slackUserId?: string; teamId?: string }> {
    const response = await api.get('/api/slack/status');
    return response.data;
  },

  async disconnect(): Promise<void> {
    await api.post('/api/slack/disconnect');
  },
};
