import { Queue } from 'bullmq';
import { bullmqQueueRedis } from '../utils/bullmqRedis';
import { config } from '../config';
import { logger } from '../utils/logger';
import { EmailJobData } from '../types';

export const emailQueue = new Queue<EmailJobData>('email-queue', {
  connection: bullmqQueueRedis,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000,
    },
    removeOnComplete: {
      count: 1000,
      age: 24 * 3600, // 24 hours
    },
    removeOnFail: {
      count: 5000,
      age: 7 * 24 * 3600, // 7 days
    },
  },
});

emailQueue.on('error', (error) => {
  logger.error({ error }, 'Email queue error');
});

emailQueue.on('waiting', (job) => {
  logger.info({ jobId: job.id }, 'Email job waiting');
});

export async function addEmailJob(emailId: string, scheduledAt: Date) {
  const delay = scheduledAt.getTime() - Date.now();
  
  if (delay <= 0) {
    logger.warn({ emailId, scheduledAt }, 'Scheduled time is in the past, adding job without delay');
  }

  await emailQueue.add(
    'send-email' as const,
    { emailId },
    {
      jobId: emailId, // Use email ID as job ID for idempotency
      delay: delay > 0 ? delay : 0,
    }
  );

  logger.info({ emailId, scheduledAt, delay }, 'Email job added to queue');
}

export async function removeEmailJob(emailId: string) {
  const job = await emailQueue.getJob(emailId);
  if (job) {
    await job.remove();
    logger.info({ emailId }, 'Email job removed from queue');
  }
}
