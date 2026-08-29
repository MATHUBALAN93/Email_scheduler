import { app } from './app';
import { config } from './config';
import { logger } from './utils/logger';

const server = app.listen(config.port, () => {
  logger.info(`Server running on port ${config.port}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT signal received: closing HTTP server');
  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
});
