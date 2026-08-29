import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  
  database: {
    url: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/email_scheduler',
  },
  
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  },
  
  elasticsearch: {
    url: process.env.ELASTICSEARCH_URL || 'http://localhost:9200',
  },
  
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    callbackUrl: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3001/auth/google/callback',
  },
  
  slack: {
    clientId: process.env.SLACK_CLIENT_ID || '',
    clientSecret: process.env.SLACK_CLIENT_SECRET || '',
    redirectUri: process.env.SLACK_REDIRECT_URI || 'http://localhost:3001/api/slack/callback',
  },
  
  ethereal: {
    host: process.env.ETHEREAL_HOST || 'smtp.ethereal.email',
    port: parseInt(process.env.ETHEREAL_PORT || '587', 10),
    user: process.env.ETHEREAL_USER || '',
    password: process.env.ETHEREAL_PASSWORD || '',
  },
  
  session: {
    secret: process.env.SESSION_SECRET || 'change-this-secret-in-production',
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'change-this-jwt-secret-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  
  worker: {
    concurrency: parseInt(process.env.WORKER_CONCURRENCY || '5', 10),
    minEmailDelayMs: parseInt(process.env.MIN_EMAIL_DELAY_MS || '2000', 10),
    maxEmailsPerHour: parseInt(process.env.MAX_EMAILS_PER_HOUR || '100', 10),
  },
  
  frontend: {
    url: process.env.FRONTEND_URL || 'http://localhost:5173',
  },
  
  backend: {
    url: process.env.BACKEND_URL || 'http://localhost:3001',
  },
} as const;

export type Config = typeof config;
