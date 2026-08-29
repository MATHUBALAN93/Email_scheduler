import axios from 'axios';
import { config } from '../config';
import { logger } from '../utils/logger';
import { SlackRepository } from '../repositories/slackRepository';

const slackRepository = new SlackRepository();

export class SlackService {
  async exchangeCodeForToken(code: string): Promise<{ accessToken: string; slackUserId?: string; teamId?: string }> {
    try {
      const response = await axios.post('https://slack.com/api/oauth.v2.access', null, {
        params: {
          client_id: config.slack.clientId,
          client_secret: config.slack.clientSecret,
          code,
          redirect_uri: config.slack.redirectUri,
        },
      });

      if (!response.data.ok) {
        throw new Error(`Slack OAuth error: ${response.data.error}`);
      }

      return {
        accessToken: response.data.access_token,
        slackUserId: response.data.authed_user?.id,
        teamId: response.data.team?.id,
      };
    } catch (error) {
      logger.error({ error }, 'Failed to exchange Slack code for token');
      throw error;
    }
  }

  async sendMessage(accessToken: string, message: string): Promise<void> {
    try {
      // First, get the user's channel to send direct message
      const authResponse = await axios.get('https://slack.com/api/auth.test', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!authResponse.data.ok) {
        throw new Error('Slack auth test failed');
      }

      const userId = authResponse.data.user_id;

      // Open a DM channel
      const conversationResponse = await axios.post('https://slack.com/api/conversations.open', {
        users: userId,
      }, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!conversationResponse.data.ok) {
        throw new Error('Failed to open Slack conversation');
      }

      const channelId = conversationResponse.data.channel.id;

      // Send the message
      await axios.post('https://slack.com/api/chat.postMessage', {
        channel: channelId,
        text: message,
      }, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      logger.info('Slack message sent successfully');
    } catch (error) {
      logger.error({ error }, 'Failed to send Slack message');
      throw error;
    }
  }

  async sendRateLimitNotification(userId: string, senderEmail: string, limit: number): Promise<void> {
    try {
      const slackConnection = await slackRepository.findByUserId(userId);
      
      if (!slackConnection) {
        logger.info({ userId }, 'No Slack connection found, skipping notification');
        return;
      }

      const message = `📧 Email rate limit reached for ${senderEmail}\n${limit} emails/hour limit has been reached.\nRemaining emails have been delayed until the next available window.`;

      await this.sendMessage(slackConnection.accessToken, message);
      
      logger.info({ userId, senderEmail }, 'Rate limit notification sent to Slack');
    } catch (error) {
      logger.error({ userId, senderEmail, error }, 'Failed to send rate limit notification to Slack');
      // Don't throw - notification failures shouldn't break the main flow
    }
  }

  async disconnectSlack(userId: string): Promise<void> {
    try {
      await slackRepository.deleteByUserId(userId);
      logger.info({ userId }, 'Slack connection disconnected');
    } catch (error) {
      logger.error({ userId, error }, 'Failed to disconnect Slack');
      throw error;
    }
  }
}

export const slackService = new SlackService();
