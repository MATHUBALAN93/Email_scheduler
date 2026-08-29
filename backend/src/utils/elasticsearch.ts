import { Client } from '@elastic/elasticsearch';
import { config } from '../config';
import { logger } from './logger';

const elasticsearch = new Client({
  node: config.elasticsearch.url,
});

elasticsearch.ping()
  .then(() => {
    logger.info('Connected to Elasticsearch');
  })
  .catch((error) => {
    logger.error({ error }, 'Failed to connect to Elasticsearch');
  });

export { elasticsearch };
