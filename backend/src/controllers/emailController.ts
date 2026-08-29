import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { EmailRepository } from '../repositories/emailRepository';
import { CampaignRepository } from '../repositories/campaignRepository';
import { SenderRepository } from '../repositories/senderRepository';
import { addEmailJob } from '../queues/emailQueue';
import { scheduleCampaignSchema, paginationSchema, emailSearchSchema } from '../utils/validation';
import { logger } from '../utils/logger';
import { ScheduleCampaignDto } from '../types';
import { elasticsearchService } from '../services/elasticsearchService';

const emailRepository = new EmailRepository();
const campaignRepository = new CampaignRepository();
const senderRepository = new SenderRepository();

export const emailController = {
  async scheduleCampaign(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Validate request body
      const validatedData = scheduleCampaignSchema.parse(req.body);
      
      // Verify sender belongs to user
      const sender = await senderRepository.findById(validatedData.senderId);
      if (!sender || sender.userId !== req.user.id) {
        return res.status(404).json({ error: 'Sender not found or unauthorized' });
      }

      // Parse recipients
      const recipients = [...new Set(validatedData.recipients)]; // Remove duplicates
      
      if (recipients.length === 0) {
        return res.status(400).json({ error: 'No valid recipients' });
      }

      // Create campaign
      const campaign = await campaignRepository.create(req.user.id, {
        subject: validatedData.subject,
        body: validatedData.body,
        startTime: new Date(validatedData.startTime),
        delayMs: validatedData.delayMs,
        hourlyLimit: validatedData.hourlyLimit,
        senderId: validatedData.senderId,
      });

      logger.info({ campaignId: campaign.id, recipientCount: recipients.length }, 'Campaign created');

      // Create email records and BullMQ jobs
      const emails = [];
      for (let i = 0; i < recipients.length; i++) {
        const scheduledAt = new Date(campaign.startTime.getTime() + (i * campaign.delayMs));
        
        // First create email without bullJobId
        const email = await emailRepository.createWithoutBullJobId({
          campaignId: campaign.id,
          senderId: validatedData.senderId,
          recipient: recipients[i],
          subject: campaign.subject,
          body: campaign.body,
          scheduledAt,
        });

        // Update bullJobId to use the actual email ID
        await emailRepository.updateBullJobId(email.id, email.id);

        // Create BullMQ job with email ID as job ID
        await addEmailJob(email.id, scheduledAt);

        emails.push(email);
      }

      logger.info({ campaignId: campaign.id, emailCount: emails.length }, 'Emails scheduled');

      // Index emails in Elasticsearch
      for (const email of emails) {
        await elasticsearchService.indexEmail({
          id: email.id,
          userId: req.user.id,
          recipient: email.recipient,
          sender: email.sender.email,
          subject: email.subject,
          status: email.status,
          scheduledAt: email.scheduledAt.toISOString(),
          createdAt: email.createdAt.toISOString(),
        });
      }

      res.status(201).json({
        campaignId: campaign.id,
        emailCount: emails.length,
        scheduledAt: campaign.startTime,
      });
    } catch (error) {
      if (error instanceof Error && error.name === 'ZodError') {
        return res.status(400).json({ error: 'Validation error', details: error.message });
      }
      logger.error({ error }, 'Error scheduling campaign');
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  async getScheduledEmails(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { page, limit } = paginationSchema.parse(req.query);
      
      const result = await emailRepository.findByUserId(req.user.id, 'SCHEDULED', { page, limit });

      res.json(result);
    } catch (error) {
      logger.error({ error }, 'Error fetching scheduled emails');
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  async getSentEmails(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { page, limit } = paginationSchema.parse(req.query);
      
      const result = await emailRepository.findByUserId(req.user.id, 'SENT', { page, limit });

      res.json(result);
    } catch (error) {
      logger.error({ error }, 'Error fetching sent emails');
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  async getEmailById(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const email = await emailRepository.findById(req.params.id);
      
      if (!email) {
        return res.status(404).json({ error: 'Email not found' });
      }

      // Verify user owns this email
      if (email.campaign.userId !== req.user.id) {
        return res.status(403).json({ error: 'Forbidden' });
      }

      res.json(email);
    } catch (error) {
      logger.error({ error }, 'Error fetching email');
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  async searchEmails(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { q, page, limit } = emailSearchSchema.parse(req.query);
      
      const result = await elasticsearchService.searchEmails(req.user.id, q, page, limit);

      res.json(result);
    } catch (error) {
      if (error instanceof Error && error.name === 'ZodError') {
        return res.status(400).json({ error: 'Validation error', details: error.message });
      }
      logger.error({ error }, 'Error searching emails');
      res.status(500).json({ error: 'Internal server error' });
    }
  },
};
