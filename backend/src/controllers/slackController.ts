import { Response, NextFunction, Request } from 'express';
import { SlackRepository } from '../repositories/slackRepository';
import { slackService } from '../services/slackService';
import { logger } from '../utils/logger';
import { config } from '../config';
import '../types/express'; // Import type declarations

const slackRepository = new SlackRepository();

export const slackController = {
  async connect(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { clientId, redirectUri } = config.slack;
      
      const slackAuthUrl = `https://slack.com/oauth/v2/authorize?client_id=${clientId}&scope=chat:write,chat:write.public&redirect_uri=${encodeURIComponent(redirectUri)}`;
      
      res.json({ authUrl: slackAuthUrl });
    } catch (error) {
      logger.error({ error }, 'Error generating Slack auth URL');
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  async callback(req: Request, res: Response, next: NextFunction) {
    try {
      const { code } = req.query;
      
      if (!code || typeof code !== 'string') {
        return res.status(400).json({ error: 'No code provided' });
      }

      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized - please login first' });
      }

      // Exchange code for token
      const { accessToken, slackUserId, teamId } = await slackService.exchangeCodeForToken(code);

      // Store or update Slack connection
      const existingConnection = await slackRepository.findByUserId(req.user.id);
      
      if (existingConnection) {
        await slackRepository.update(existingConnection.id, {
          slackUserId,
          teamId,
          accessToken,
        });
      } else {
        await slackRepository.create({
          userId: req.user.id,
          slackUserId,
          teamId,
          accessToken,
        });
      }

      logger.info({ userId: req.user.id }, 'Slack connected successfully');

      res.redirect(`${process.env.FRONTEND_URL}/dashboard?slack_connected=true`);
    } catch (error) {
      logger.error({ error }, 'Error in Slack OAuth callback');
      res.redirect(`${process.env.FRONTEND_URL}/dashboard?slack_error=true`);
    }
  },

  async getStatus(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const connection = await slackRepository.findByUserId(req.user.id);
      
      if (!connection) {
        return res.json({ connected: false });
      }

      res.json({
        connected: true,
        slackUserId: connection.slackUserId,
        teamId: connection.teamId,
      });
    } catch (error) {
      logger.error({ error }, 'Error fetching Slack status');
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  async disconnect(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      await slackService.disconnectSlack(req.user.id);

      res.json({ message: 'Slack disconnected successfully' });
    } catch (error) {
      logger.error({ error }, 'Error disconnecting Slack');
      res.status(500).json({ error: 'Internal server error' });
    }
  },
};
