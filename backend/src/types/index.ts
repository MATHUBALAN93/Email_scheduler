import { EmailStatus } from '@prisma/client';

export interface CreateEmailDto {
  campaignId: string;
  senderId: string;
  recipient: string;
  subject: string;
  body: string;
  scheduledAt: Date;
  bullJobId: string;
}

export interface ScheduleCampaignDto {
  subject: string;
  body: string;
  startTime: Date;
  delayMs: number;
  hourlyLimit: number;
  senderId: string;
  recipients: string[];
}

export interface EmailSearchParams {
  q: string;
  userId: string;
  page?: number;
  limit?: number;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface EmailJobData {
  emailId: string;
}

export interface RateLimitResult {
  allowed: boolean;
  currentCount: number;
  limit: number;
  nextAvailableTime?: Date;
}
