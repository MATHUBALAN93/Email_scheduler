# Email Scheduler Application

A production-quality full-stack email scheduling application inspired by ReachInbox / Outbox Labs. This application allows users to schedule emails with advanced features like rate limiting, distributed processing, and real-time monitoring.

## 🏗️ Architecture

```mermaid
graph TB
    subgraph "Frontend"
        FE[React + TypeScript]
        FE -->|HTTP/REST| API[Express API]
    end
    
    subgraph "Backend"
        API --> Controllers[Controllers]
        Controllers --> Services[Services]
        Services --> Repositories[Repositories]
        Services --> Queue[BullMQ Queue]
        Services --> ES[Elasticsearch]
        Repositories --> PG[(PostgreSQL)]
    end
    
    subgraph "Infrastructure"
        Queue --> Redis[(Redis)]
        Workers[BullMQ Workers] --> Redis
        Workers --> ES
        Workers --> SMTP[Ethereal SMTP]
    end
    
    subgraph "OAuth"
        Google[Google OAuth]
        Slack[Slack OAuth]
        FE --> Google
        FE --> Slack
        API --> Google
        API --> Slack
    end
```

## 🚀 Technology Stack

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **React Router** - Navigation
- **TanStack Query** - Server state management
- **Axios** - HTTP client
- **Lucide React** - Icons
- **date-fns** - Date manipulation

### Backend
- **Node.js + TypeScript** - Runtime
- **Express.js** - Web framework
- **Prisma ORM** - Database ORM
- **PostgreSQL** - Primary database
- **BullMQ** - Job queue
- **Redis** - Queue backend & caching
- **Elasticsearch** - Search engine
- **Nodemailer** - Email sending
- **Ethereal Email** - SMTP testing
- **Passport.js** - Authentication
- **Zod** - Request validation
- **Pino** - Structured logging

### Infrastructure
- **Docker Compose** - Container orchestration
- **PostgreSQL** - Relational database
- **Redis** - In-memory data store
- **Elasticsearch** - Search and analytics

## 📁 Project Structure

```
Email_automater/
├── frontend/
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── layouts/        # Layout components
│   │   ├── features/       # Feature-specific modules
│   │   ├── hooks/          # Custom React hooks
│   │   ├── services/       # API services
│   │   ├── types/          # TypeScript types
│   │   ├── utils/          # Utility functions
│   │   ├── App.tsx         # Main app component
│   │   └── main.tsx        # Entry point
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.js
├── backend/
│   ├── src/
│   │   ├── config/         # Configuration
│   │   ├── controllers/    # Request handlers
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   ├── queues/         # BullMQ queues
│   │   ├── workers/        # Job processors
│   │   ├── middleware/     # Express middleware
│   │   ├── repositories/   # Data access layer
│   │   ├── utils/          # Utility functions
│   │   ├── types/          # TypeScript types
│   │   ├── app.ts          # Express app setup
│   │   └── server.ts       # Server entry point
│   ├── prisma/
│   │   └── schema.prisma   # Database schema
│   └── package.json
├── docker-compose.yml
├── .env.example
└── README.md
```

## 🛠️ Setup Instructions

### Prerequisites
- Node.js 18+ 
- Docker and Docker Compose
- Git

### 1. Clone the Repository
```bash
git clone <repository-url>
cd Email_automater
```

### 2. Start Infrastructure Services
```bash
docker-compose up -d
```

This will start:
- PostgreSQL on port 5432
- Redis on port 6379
- Elasticsearch on port 9200

### 3. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Copy environment variables
cp ../.env.example .env

# Generate Prisma client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# Start the backend server
npm run dev
```

The backend will start on `http://localhost:3001`

### 4. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Start the development server
npm run dev
```

The frontend will start on `http://localhost:5173`

### 5. Start the Worker (in a separate terminal)

```bash
cd backend
npm run worker
```

## 🔐 Environment Variables

### Backend (.env)
```env
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/email_scheduler"

# Redis
REDIS_URL="redis://localhost:6379"

# Elasticsearch
ELASTICSEARCH_URL="http://localhost:9200"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GOOGLE_CALLBACK_URL="http://localhost:3001/auth/google/callback"

# Slack OAuth
SLACK_CLIENT_ID="your-slack-client-id"
SLACK_CLIENT_SECRET="your-slack-client-secret"
SLACK_REDIRECT_URI="http://localhost:3001/api/slack/callback"

# Ethereal Email (SMTP)
ETHEREAL_HOST="smtp.ethereal.email"
ETHEREAL_PORT=587
ETHEREAL_USER="your-ethereal-user"
ETHEREAL_PASSWORD="your-ethereal-password"

# Session
SESSION_SECRET="your-session-secret-change-this-in-production"

# Worker Configuration
WORKER_CONCURRENCY=5
MIN_EMAIL_DELAY_MS=2000
MAX_EMAILS_PER_HOUR=100

# Frontend & Backend URLs
FRONTEND_URL="http://localhost:5173"
BACKEND_URL="http://localhost:3001"

# Port
PORT=3001
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:3001
```

## 🔌 OAuth Setup

### Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:3001/auth/google/callback`
6. Copy Client ID and Client Secret to `.env`

### Slack OAuth
1. Go to [Slack API](https://api.slack.com/apps)
2. Create a new app
3. Add OAuth permissions: `chat:write`, `chat:write.public`
4. Install app to your workspace
5. Copy Client ID and Client Secret to `.env`
6. Set redirect URI: `http://localhost:3001/api/slack/callback`

### Ethereal Email
1. Go to [Ethereal Email](https://ethereal.email/)
2. Create an account or sign in
3. Copy SMTP credentials to `.env`

## 📊 How It Works

### Email Scheduling Flow

1. **User Authentication**: User logs in via Google OAuth
2. **Compose Email**: User creates email campaign with recipients, subject, body, and scheduling parameters
3. **Validation**: Backend validates request and recipients
4. **Database Storage**: Campaign and individual email records are created in PostgreSQL
5. **Job Creation**: BullMQ delayed jobs are created for each email
6. **Persistence**: Jobs are stored in Redis with calculated delays
7. **Worker Processing**: At scheduled time, BullMQ worker processes the job
8. **Idempotency Check**: Worker checks if email is already being processed
9. **Rate Limiting**: Redis-based rate limiting per sender per hour
10. **Email Sending**: Email is sent via Ethereal SMTP
11. **Status Update**: PostgreSQL record is updated to SENT
12. **Elasticsearch Indexing**: Email is indexed for search
13. **Dashboard Update**: Frontend reflects new state

### BullMQ Delayed Jobs

- Each email gets a BullMQ delayed job with `jobId = email.id`
- Delay is calculated as `scheduledAt - Date.now()`
- Jobs persist in Redis across server restarts
- No recreation of jobs on startup (prevents duplicates)

### Idempotency

- Email ID used as BullMQ job ID prevents duplicate jobs
- Atomic status transition: `SCHEDULED → PROCESSING`
- Worker checks status before processing
- Only one worker can successfully transition status

### Concurrency

- Worker concurrency is configurable via `WORKER_CONCURRENCY`
- Multiple workers can run simultaneously
- Redis coordinates state across workers

### Rate Limiting

- Redis atomic counters per sender per hour
- Key format: `email-rate:{senderId}:{YYYYMMDDHH}`
- Counter expires after 1 hour
- Jobs are rescheduled to next hour when limit reached

### Minimum Delay

- Redis-based coordination for minimum delay between emails
- Key format: `email-delay:{senderId}`
- Last sent time tracked with expiry
- Multiple workers respect the delay

### Slack Notifications

- Real Slack API messages when rate limit is reached
- Sent only once per hour per sender
- Application continues if Slack is not connected

### Elasticsearch Search

- Emails indexed on creation and status changes
- Full-text search on recipient, sender, subject
- User-scoped search results
- Graceful handling of indexing failures

## 🧪 Testing

### Manual Testing Steps

1. **Start Infrastructure**: `docker-compose up -d`
2. **Start Backend**: `cd backend && npm run dev`
3. **Start Worker**: `cd backend && npm run worker`
4. **Start Frontend**: `cd frontend && npm run dev`
5. **Test Login**: Navigate to `http://localhost:5173` and login with Google
6. **Test Compose**: Create a campaign with test emails
7. **Test Scheduling**: Schedule emails for near future
8. **Monitor Jobs**: Check Bull Board at `http://localhost:3001/admin/queues`
9. **Verify Emails**: Check Ethereal for sent emails
10. **Test Rate Limit**: Set low hourly limit and verify rescheduling
11. **Test Slack**: Connect Slack and verify notifications
12. **Test Restart**: Stop and restart backend, verify jobs persist

### Automated Testing

To run tests (when implemented):
```bash
cd backend
npm test
```

## 📈 API Documentation

### Authentication

#### `GET /auth/google`
Initiates Google OAuth flow

#### `GET /auth/google/callback`
Google OAuth callback endpoint

#### `GET /auth/me`
Get current user info (requires authentication)

#### `POST /auth/logout`
Logout current user

### Emails

#### `POST /api/emails/schedule`
Schedule a new email campaign

**Request Body:**
```json
{
  "subject": "Test Email",
  "body": "<p>Email content</p>",
  "startTime": "2024-01-01T10:00:00Z",
  "delayMs": 2000,
  "hourlyLimit": 100,
  "senderId": "sender-uuid",
  "recipients": ["user@example.com"]
}
```

#### `GET /api/emails/scheduled?page=1&limit=10`
Get scheduled emails for current user

#### `GET /api/emails/sent?page=1&limit=10`
Get sent emails for current user

#### `GET /api/emails/search?q=query&page=1&limit=10`
Search emails

#### `GET /api/emails/:id`
Get email by ID

### Senders

#### `GET /api/senders`
Get all senders for current user

#### `POST /api/senders`
Create a new sender

**Request Body:**
```json
{
  "email": "sender@example.com",
  "smtpHost": "smtp.ethereal.email",
  "smtpPort": 587,
  "smtpUser": "user",
  "smtpPassword": "password"
}
```

#### `DELETE /api/senders/:id`
Delete a sender

### Slack

#### `GET /api/slack/connect`
Get Slack OAuth URL

#### `GET /api/slack/callback`
Slack OAuth callback

#### `GET /api/slack/status`
Get Slack connection status

#### `POST /api/slack/disconnect`
Disconnect Slack

### Monitoring

#### `GET /admin/queues`
Bull Board dashboard for monitoring queues

## 🎯 Demo Requirements

The application supports the following demo flow:

1. ✅ Login using Google OAuth
2. ✅ Show dashboard with stats
3. ✅ Click Compose to create email
4. ✅ Enter subject and body
5. ✅ Upload CSV with test emails
6. ✅ Show detected email count
7. ✅ Select start time
8. ✅ Set delay to small test value
9. ✅ Set hourly limit to small test value
10. ✅ Schedule emails
11. ✅ Show emails under Scheduled
12. ✅ Open Bull Board and show delayed jobs
13. ✅ Wait for worker processing
14. ✅ Show email sent through Ethereal
15. ✅ Show email under Sent
16. ✅ Search for an email
17. ✅ Demonstrate rate limiting
18. ✅ Show remaining jobs delayed/rescheduled
19. ✅ Show Slack notification when rate limit reached
20. ✅ Stop backend
21. ✅ Restart backend
22. ✅ Verify future scheduled email is still processed

## ⚙️ Development Mode Configuration

For easy demonstration, use these values in `.env`:

```env
WORKER_CONCURRENCY=2
MIN_EMAIL_DELAY_MS=2000
MAX_EMAILS_PER_HOUR=3
```

## 🔒 Security

- Helmet for HTTP headers
- CORS configuration
- Request validation with Zod
- Authentication middleware
- Authorization checks
- Secure session handling
- No secrets in Git
- HTML sanitization for rich text
- Rate limiting on sensitive APIs
- Proper error responses
- SMTP credentials never exposed to frontend

## 📝 Known Trade-offs

### Exactly-Once Delivery
The architecture provides strong guarantees for exactly-once delivery, but absolute exactly-once cannot be guaranteed due to:
- SMTP acknowledgments not being transactional with database updates
- Network failures between SMTP send and database commit
- BullMQ retry mechanisms may cause duplicate processing in edge cases

The system mitigates this through:
- Idempotent status transitions
- Email ID as job ID
- Atomic database operations
- Redis-based coordination

### Elasticsearch Consistency
Elasticsearch updates are eventual:
- Index updates happen after database commits
- Indexing failures don't block main flow
- Slight delay between database state and search index

### Rate Limiting Precision
Rate limiting is per-hour windows:
- Jobs at end of hour may be delayed more than necessary
- Next hour starts at exact hour boundary
- Not sub-hour precision

## 🚀 Deployment

### Production Considerations

1. **Environment Variables**: Never commit `.env` files
2. **Secrets Management**: Use proper secret management (AWS Secrets Manager, etc.)
3. **Database**: Use managed PostgreSQL (RDS, etc.)
4. **Redis**: Use managed Redis (ElastiCache, etc.)
5. **Elasticsearch**: Use managed Elasticsearch (AWS OpenSearch, etc.)
6. **SSL/TLS**: Enable HTTPS in production
7. **Session Storage**: Use Redis for session storage in production
8. **Monitoring**: Add application monitoring (Datadog, New Relic, etc.)
9. **Logging**: Centralized logging (ELK stack, CloudWatch, etc.)
10. **Scaling**: Horizontal scaling of workers and API servers

## 🤝 Contributing

This is a hiring assignment. Please follow the implementation guidelines and ensure all requirements are met before submission.

## 📄 License

ISC

## 🙏 Acknowledgments

- Inspired by ReachInbox / Outbox Labs
- Built with modern web technologies
- Uses production-grade patterns and best practices
