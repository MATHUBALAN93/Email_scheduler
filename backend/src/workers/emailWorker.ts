import { Worker, Job } from 'bullmq';
import { bullmqWorkerRedis } from '../utils/bullmqRedis';
import { redis } from '../utils/redis';
import { config } from '../config';
import { logger } from '../utils/logger';
import { EmailRepository } from '../repositories/emailRepository';
import { emailService } from '../services/emailService';
import { elasticsearchService } from '../services/elasticsearchService';
import { slackService } from '../services/slackService';
import { EmailJobData } from '../types';
import { addEmailJob } from '../queues/emailQueue';
import { EmailStatus } from '@prisma/client';

const emailRepository = new EmailRepository();

async function processEmailJob(job: Job<EmailJobData>) {
  const { emailId } = job.data;
  
  logger.info({ emailId, jobId: job.id }, 'Processing email job');

  // Fetch email record
  const email = await emailRepository.findById(emailId);
  if (!email) {
    logger.error({ emailId }, 'Email not found');
    throw new Error('Email not found');
  }

  // Idempotency check: if already sent or processing, skip
  if (email.status === EmailStatus.SENT) {
    logger.info({ emailId }, 'Email already sent, skipping');
    return;
  }

  if (email.status === EmailStatus.PROCESSING) {
    logger.warn({ emailId }, 'Email already being processed, potential duplicate job');
    // Still continue to handle edge cases
  }

  // Atomically transition from SCHEDULED to PROCESSING
  const updateResult = await emailRepository.updateStatusAtomically(
    emailId,
    EmailStatus.SCHEDULED,
    EmailStatus.PROCESSING
  );

  if (updateResult.count === 0) {
    // Someone else already transitioned it
    logger.info({ emailId, currentStatus: email.status }, 'Email status already changed, skipping');
    return;
  }

  logger.info({ emailId }, 'Email status transitioned to PROCESSING');

  try {
    // Check rate limit
    const rateLimitKey = `email-rate:${email.senderId}:${new Date().toISOString().slice(0, 13)}`; // YYYYMMDDHH
    const currentCount = await redis.incr(rateLimitKey);
    
    if (currentCount === 1) {
      // Set expiry for the counter (1 hour)
      await redis.expire(rateLimitKey, 3600);
    }

    logger.info({ emailId, senderId: email.senderId, currentCount, limit: config.worker.maxEmailsPerHour }, 'Rate limit check');

    if (currentCount > config.worker.maxEmailsPerHour) {
      // Rate limit exceeded, reschedule to next hour
      const nextHour = new Date();
      nextHour.setHours(nextHour.getHours() + 1);
      nextHour.setMinutes(0, 0, 0);
      
      logger.info({ emailId, nextHour }, 'Rate limit exceeded, rescheduling email');
      
      // Send Slack notification (only once per hour per sender)
      if (currentCount === config.worker.maxEmailsPerHour + 1) {
        await slackService.sendRateLimitNotification(
          email.campaign.userId,
          email.sender.email,
          config.worker.maxEmailsPerHour
        );
      }
      
      // Update status back to SCHEDULED with new time
      await emailRepository.updateStatus(emailId, EmailStatus.SCHEDULED);
      
      // Re-add job with new delay
      await addEmailJob(emailId, nextHour);
      
      return;
    }

    // Apply minimum delay between emails using Redis for coordination
    if (config.worker.minEmailDelayMs > 0) {
      const delayKey = `email-delay:${email.senderId}`;
      const lastSent = await redis.get(delayKey);
      
      if (lastSent) {
        const elapsed = Date.now() - parseInt(lastSent as string);
        const remainingDelay = config.worker.minEmailDelayMs - elapsed;
        
        if (remainingDelay > 0) {
          logger.info({ emailId, remainingDelay }, 'Applying minimum delay between emails');
          await new Promise(resolve => setTimeout(resolve, remainingDelay));
        }
      }
      
      // Update last sent time
      await redis.set(delayKey, Date.now().toString());
      await redis.expire(delayKey, config.worker.minEmailDelayMs / 1000 + 10);
    }

    // Send email
    const result = await emailService.sendEmail(
      email.recipient,
      email.subject,
      email.body,
      email.senderId,
      email.attachments as any
    );

    // Update status to SENT
    await emailRepository.updateStatus(emailId, EmailStatus.SENT, new Date());

    logger.info({ emailId, messageId: result.messageId }, 'Email sent successfully');

    // Update Elasticsearch index
    await elasticsearchService.updateEmail({
      id: email.id,
      userId: email.campaign.userId,
      recipient: email.recipient,
      sender: email.sender.email,
      subject: email.subject,
      status: EmailStatus.SENT,
      scheduledAt: email.scheduledAt.toISOString(),
      sentAt: new Date().toISOString(),
      createdAt: email.createdAt.toISOString(),
    });

  } catch (error) {
    logger.error({ emailId, error }, 'Failed to send email');
    
    // Update status to FAILED
    await emailRepository.updateStatus(
      emailId,
      EmailStatus.FAILED,
      undefined,
      error instanceof Error ? error.message : 'Unknown error'
    );
    
    throw error; // This will trigger BullMQ retry
  }
}

const worker = new Worker<EmailJobData>(
  'email-queue',
  processEmailJob,
  {
    connection: bullmqWorkerRedis,
    concurrency: config.worker.concurrency,
  }
);

worker.on('error', (error) => {
  logger.error({ error }, 'Email worker error');
});

worker.on('completed', (job) => {
  logger.info({ jobId: job.id }, 'Email worker completed job');
});

worker.on('failed', (job, error) => {
  logger.error({ jobId: job?.id, error }, 'Email worker failed job');
});

logger.info('Email worker started');

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, closing worker');
  await worker.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, closing worker');
  await worker.close();
  process.exit(0);
});
