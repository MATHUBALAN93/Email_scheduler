import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import { config } from './config';
import { logger } from './utils/logger';
import { passport } from './config/passport';
import { authRoutes } from './routes/auth';
import { emailRoutes } from './routes/emails';
import { senderRoutes } from './routes/senders';
import { slackRoutes } from './routes/slack';
import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { ExpressAdapter } from '@bull-board/express';
import { emailQueue } from './queues/emailQueue';
import { elasticsearchService } from './services/elasticsearchService';

const app = express();

app.use(helmet());
app.use(cors({
  origin: config.frontend.url,
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({
  secret: config.session.secret,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  },
}));
app.use(passport.initialize());
app.use(passport.session());

// Initialize Elasticsearch index
elasticsearchService.ensureIndex().catch(error => {
  logger.error({ error }, 'Failed to initialize Elasticsearch index');
});

// Routes
app.use('/auth', authRoutes);
app.use('/api/emails', emailRoutes);
app.use('/api/senders', senderRoutes);
app.use('/api/slack', slackRoutes);

// Bull Board for monitoring queues
const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath('/admin/queues');

createBullBoard({
  queues: [new BullMQAdapter(emailQueue)],
  serverAdapter,
});

app.use('/admin/queues', serverAdapter.getRouter());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export { app };
