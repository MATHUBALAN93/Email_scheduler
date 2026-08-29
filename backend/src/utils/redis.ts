import { createClient } from 'redis';
import { config } from '../config';
import { logger } from './logger';

const redis = createClient({
  url: config.redis.url,
});

redis.on('error', (error) => {
  logger.error({ error }, 'Redis connection error');
});

redis.on('connect', () => {
  logger.info('Connected to Redis');
});

export { redis };
