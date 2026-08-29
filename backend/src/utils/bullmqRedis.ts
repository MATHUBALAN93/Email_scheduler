import Redis from 'ioredis';
import { config } from '../config';
import { logger } from './logger';

// Create ioredis connection for BullMQ
export const createBullMQRedis = (): any => {
  const redis = new Redis(config.redis.url, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
  });

  redis.on('error', (error: Error) => {
    logger.error({ error }, 'BullMQ Redis connection error');
  });

  redis.on('connect', () => {
    logger.info('BullMQ Redis connected');
  });

  return redis;
};

// Create separate connections for Queue and Worker
export const bullmqQueueRedis = createBullMQRedis();
export const bullmqWorkerRedis = createBullMQRedis();
