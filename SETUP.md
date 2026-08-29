# Quick Setup Guide

## Prerequisites
- Node.js 18+
- Docker and Docker Compose
- Git

## Installation Steps

### 1. Start Infrastructure
```bash
docker-compose up -d
```

### 2. Backend Setup
```bash
cd backend
npm install
cp ../.env.example .env
# Edit .env with your credentials
npm run prisma:generate
npm run prisma:migrate
npm run dev
```

### 3. Frontend Setup (New Terminal)
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

### 4. Start Worker (New Terminal)
```bash
cd backend
npm run worker
```

## Access Points
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001
- Bull Board: http://localhost:3001/admin/queues
- PostgreSQL: localhost:5432
- Redis: localhost:6379
- Elasticsearch: http://localhost:9200

## Required OAuth Setup

### Google OAuth
1. Go to Google Cloud Console
2. Create OAuth 2.0 credentials
3. Add redirect: `http://localhost:3001/auth/google/callback`
4. Update `.env` with credentials

### Ethereal Email
1. Go to https://ethereal.email/
2. Create account and get SMTP credentials
3. Update `.env` with credentials

### Slack OAuth (Optional)
1. Go to Slack API
2. Create app with `chat:write` permission
3. Add redirect: `http://localhost:3001/api/slack/callback`
4. Update `.env` with credentials

## Demo Configuration
For quick testing, use these values in backend `.env`:
```env
WORKER_CONCURRENCY=2
MIN_EMAIL_DELAY_MS=2000
MAX_EMAILS_PER_HOUR=3
```

## Troubleshooting

### Docker Issues
```bash
docker-compose down
docker-compose up -d
```

### Database Issues
```bash
cd backend
npm run prisma:studio  # Check database
npm run prisma:migrate reset  # Reset database
```

### Redis Issues
```bash
redis-cli
> FLUSHALL
> EXIT
```

### Elasticsearch Issues
```bash
curl http://localhost:9200/_cluster/health
```
