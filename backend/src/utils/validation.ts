import { z } from 'zod';

export const scheduleCampaignSchema = z.object({
  subject: z.string().min(1, 'Subject is required').max(500),
  body: z.string().min(1, 'Body is required'),
  startTime: z.string().datetime('Invalid date format'),
  delayMs: z.number().int().min(0, 'Delay must be non-negative'),
  hourlyLimit: z.number().int().min(1, 'Hourly limit must be at least 1'),
  senderId: z.string().uuid('Invalid sender ID'),
  recipients: z.array(z.string().email('Invalid email address')).min(1, 'At least one recipient is required'),
  attachments: z.array(z.object({
    name: z.string(),
    size: z.number(),
    type: z.string(),
    content: z.string(),
  })).optional(),
});

export const emailSearchSchema = z.object({
  q: z.string().min(1, 'Search query is required'),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(10),
});

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(10),
});

export type ScheduleCampaignInput = z.infer<typeof scheduleCampaignSchema>;
export type EmailSearchInput = z.infer<typeof emailSearchSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
