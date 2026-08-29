import { elasticsearch } from '../utils/elasticsearch';
import { logger } from '../utils/logger';
import { EmailStatus } from '@prisma/client';

const EMAIL_INDEX = 'emails';

export interface EmailDocument {
  id: string;
  userId: string;
  recipient: string;
  sender: string;
  subject: string;
  status: EmailStatus;
  scheduledAt: string;
  sentAt?: string;
  createdAt: string;
}

export class ElasticsearchService {
  async ensureIndex() {
    const indexExists = await elasticsearch.indices.exists({ index: EMAIL_INDEX });
    
    if (!indexExists) {
      await elasticsearch.indices.create({
        index: EMAIL_INDEX,
        body: {
          mappings: {
            properties: {
              id: { type: 'keyword' },
              userId: { type: 'keyword' },
              recipient: { type: 'text', fields: { keyword: { type: 'keyword' } } },
              sender: { type: 'text', fields: { keyword: { type: 'keyword' } } },
              subject: { type: 'text', fields: { keyword: { type: 'keyword' } } },
              status: { type: 'keyword' },
              scheduledAt: { type: 'date' },
              sentAt: { type: 'date' },
              createdAt: { type: 'date' },
            },
          },
        },
      });
      logger.info('Elasticsearch index created');
    }
  }

  async indexEmail(email: EmailDocument) {
    try {
      await elasticsearch.index({
        index: EMAIL_INDEX,
        id: email.id,
        body: email,
      });
      logger.info({ emailId: email.id }, 'Email indexed in Elasticsearch');
    } catch (error) {
      logger.error({ emailId: email.id, error }, 'Failed to index email in Elasticsearch');
      // Don't throw - indexing failures shouldn't break the main flow
    }
  }

  async updateEmail(email: EmailDocument) {
    try {
      await elasticsearch.update({
        index: EMAIL_INDEX,
        id: email.id,
        body: {
          doc: email,
        },
      });
      logger.info({ emailId: email.id }, 'Email updated in Elasticsearch');
    } catch (error) {
      logger.error({ emailId: email.id, error }, 'Failed to update email in Elasticsearch');
      // Don't throw - indexing failures shouldn't break the main flow
    }
  }

  async deleteEmail(emailId: string) {
    try {
      await elasticsearch.delete({
        index: EMAIL_INDEX,
        id: emailId,
      });
      logger.info({ emailId }, 'Email deleted from Elasticsearch');
    } catch (error) {
      logger.error({ emailId, error }, 'Failed to delete email from Elasticsearch');
      // Don't throw - indexing failures shouldn't break the main flow
    }
  }

  async searchEmails(userId: string, query: string, page: number = 1, limit: number = 10) {
    try {
      const from = (page - 1) * limit;
      
      const result = await elasticsearch.search({
        index: EMAIL_INDEX,
        body: {
          query: {
            bool: {
              must: [
                { term: { userId } },
                {
                  multi_match: {
                    query,
                    fields: ['recipient', 'sender', 'subject'],
                    fuzziness: 'AUTO',
                  },
                },
              ],
            },
          },
          from,
          size: limit,
          sort: [
            { createdAt: { order: 'desc' } },
          ],
        },
      });

      const hits = result.hits.hits as Array<{
        _id: string;
        _source: EmailDocument;
      }>;

      return {
        data: hits.map(hit => ({
          id: hit._id,
          userId: hit._source.userId,
          recipient: hit._source.recipient,
          sender: hit._source.sender,
          subject: hit._source.subject,
          status: hit._source.status,
          scheduledAt: hit._source.scheduledAt,
          sentAt: hit._source.sentAt,
          createdAt: hit._source.createdAt,
        })),
        total: typeof result.hits.total === 'number' ? result.hits.total : (result.hits.total?.value || 0),
        page,
        limit,
        totalPages: Math.ceil((typeof result.hits.total === 'number' ? result.hits.total : (result.hits.total?.value || 0)) / limit),
      };
    } catch (error) {
      logger.error({ userId, query, error }, 'Elasticsearch search failed');
      throw error;
    }
  }
}

export const elasticsearchService = new ElasticsearchService();
