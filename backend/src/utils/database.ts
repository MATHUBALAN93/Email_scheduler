import { PrismaClient } from '@prisma/client';
import { logger } from './logger';

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' 
    ? ['query', 'error', 'warn'] 
    : ['error'],
});

prisma.$connect()
  .then(() => {
    logger.info('Connected to PostgreSQL database');
  })
  .catch((error) => {
    logger.error({ error }, 'Failed to connect to PostgreSQL database');
    process.exit(1);
  });

export { prisma };
