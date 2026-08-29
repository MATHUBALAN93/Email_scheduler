import nodemailer from 'nodemailer';
import { config } from '../config';
import { logger } from '../utils/logger';

export class EmailService {
  private transporter: nodemailer.Transporter | null = null;

  constructor() {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    this.transporter = nodemailer.createTransport({
      host: config.ethereal.host,
      port: config.ethereal.port,
      secure: false,
      auth: {
        user: config.ethereal.user,
        pass: config.ethereal.password,
      },
    });

    this.transporter.verify((error, success) => {
      if (error) {
        logger.error({ error }, 'Ethereal SMTP connection failed');
      } else {
        logger.info('Ethereal SMTP connection established');
      }
    });
  }

  async sendEmail(to: string, subject: string, body: string, from: string): Promise<{ messageId: string; previewUrl?: string }> {
    if (!this.transporter) {
      throw new Error('Email transporter not initialized');
    }

    try {
      const info = await this.transporter.sendMail({
        from,
        to,
        subject,
        html: body,
      });

      logger.info({ messageId: info.messageId, to }, 'Email sent successfully');

      return {
        messageId: info.messageId,
        previewUrl: nodemailer.getTestMessageUrl(info) || undefined,
      };
    } catch (error) {
      logger.error({ error, to }, 'Failed to send email');
      throw error;
    }
  }

  async testConnection(): Promise<boolean> {
    if (!this.transporter) {
      return false;
    }

    try {
      await this.transporter.verify();
      return true;
    } catch (error) {
      logger.error({ error }, 'Email connection test failed');
      return false;
    }
  }
}

export const emailService = new EmailService();
