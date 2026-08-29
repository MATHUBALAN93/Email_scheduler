import nodemailer from 'nodemailer';
import { config } from '../config';
import { logger } from '../utils/logger';
import { SenderRepository } from '../repositories/senderRepository';

const senderRepository = new SenderRepository();

export class EmailService {
  private etherealTransporter: nodemailer.Transporter | null = null;

  constructor() {
    this.initializeEtherealTransporter();
  }

  private initializeEtherealTransporter() {
    this.etherealTransporter = nodemailer.createTransport({
      host: config.ethereal.host,
      port: config.ethereal.port,
      secure: false,
      auth: {
        user: config.ethereal.user,
        pass: config.ethereal.password,
      },
    });

    this.etherealTransporter.verify((error, success) => {
      if (error) {
        logger.error({ error }, 'Ethereal SMTP connection failed');
      } else {
        logger.info('Ethereal SMTP connection established');
      }
    });
  }

  private createSenderTransporter(sender: any): nodemailer.Transporter {
    return nodemailer.createTransport({
      host: sender.smtpHost,
      port: sender.smtpPort,
      secure: sender.smtpPort === 465, // SSL for port 465
      auth: {
        user: sender.smtpUser,
        pass: sender.smtpPassword,
      },
    });
  }

  async sendEmail(to: string, subject: string, body: string, senderId: string, attachments?: any[]): Promise<{ messageId: string; previewUrl?: string }> {
    try {
      // Get sender details
      const sender = await senderRepository.findById(senderId);
      if (!sender) {
        throw new Error('Sender not found');
      }

      // Create transporter with sender's SMTP credentials
      const transporter = this.createSenderTransporter(sender);

      const mailOptions: any = {
        from: sender.email,
        to,
        subject,
        html: body,
      };

      // Add attachments if provided
      if (attachments && attachments.length > 0) {
        mailOptions.attachments = attachments.map((att: any) => ({
          filename: att.name,
          content: att.content,
          encoding: 'base64',
        }));
      }

      const info = await transporter.sendMail(mailOptions);

      logger.info({ messageId: info.messageId, to, senderEmail: sender.email, attachmentCount: attachments?.length }, 'Email sent successfully');

      return {
        messageId: info.messageId,
      };
    } catch (error) {
      logger.error({ error, to, senderId }, 'Failed to send email');
      throw error;
    }
  }

  async sendEmailWithEthereal(to: string, subject: string, body: string, from: string): Promise<{ messageId: string; previewUrl?: string }> {
    if (!this.etherealTransporter) {
      throw new Error('Ethereal transporter not initialized');
    }

    try {
      const info = await this.etherealTransporter.sendMail({
        from,
        to,
        subject,
        html: body,
      });

      logger.info({ messageId: info.messageId, to }, 'Email sent successfully via Ethereal');

      return {
        messageId: info.messageId,
        previewUrl: nodemailer.getTestMessageUrl(info) || undefined,
      };
    } catch (error) {
      logger.error({ error, to }, 'Failed to send email via Ethereal');
      throw error;
    }
  }

  async testConnection(): Promise<boolean> {
    if (!this.etherealTransporter) {
      return false;
    }

    try {
      await this.etherealTransporter.verify();
      return true;
    } catch (error) {
      logger.error({ error }, 'Email connection test failed');
      return false;
    }
  }
}

export const emailService = new EmailService();
