import { Response, NextFunction, Request } from 'express';
import { SenderRepository } from '../repositories/senderRepository';
import { logger } from '../utils/logger';
import { z } from 'zod';
import '../types/express';

const senderRepository = new SenderRepository();

const createSenderSchema = z.object({
  email: z.string().email('Invalid email address'),
  smtpHost: z.string().min(1, 'SMTP host is required'),
  smtpPort: z.number().int().min(1).max(65535, 'Invalid SMTP port'),
  smtpUser: z.string().min(1, 'SMTP user is required'),
  smtpPassword: z.string().min(1, 'SMTP password is required'),
});

type CreateSenderData = {
  email: string;
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPassword: string;
};

export const senderController = {
  async getSenders(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const senders = await senderRepository.findByUserId(req.user.id);

      res.json(senders);
    } catch (error) {
      logger.error({ error }, 'Error fetching senders');
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  async createSender(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const validatedData = createSenderSchema.parse(
        req.body
      ) as CreateSenderData;

      const sender = await senderRepository.create({
        userId: req.user.id,
        email: validatedData.email,
        smtpHost: validatedData.smtpHost,
        smtpPort: validatedData.smtpPort,
        smtpUser: validatedData.smtpUser,
        smtpPassword: validatedData.smtpPassword,
      });

      logger.info({ senderId: sender.id }, 'Sender created');

      res.status(201).json(sender);
    } catch (error) {
      if (error instanceof Error && error.name === 'ZodError') {
        return res.status(400).json({
          error: 'Validation error',
          details: error.message,
        });
      }

      logger.error({ error }, 'Error creating sender');

      res.status(500).json({
        error: 'Internal server error',
      });
    }
  },

  async deleteSender(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const sender = await senderRepository.findById(req.params.id);

      if (!sender || sender.userId !== req.user.id) {
        return res.status(404).json({
          error: 'Sender not found or unauthorized',
        });
      }

      await senderRepository.delete(req.params.id);

      logger.info(
        { senderId: req.params.id },
        'Sender deleted'
      );

      res.json({
        message: 'Sender deleted successfully',
      });
    } catch (error) {
      logger.error({ error }, 'Error deleting sender');

      res.status(500).json({
        error: 'Internal server error',
      });
    }
  },
};