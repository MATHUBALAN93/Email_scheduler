export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
}

export interface Sender {
  id: string;
  userId: string;
  email: string;
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  createdAt: string;
  updatedAt: string;
}

export interface Campaign {
  id: string;
  userId: string;
  subject: string;
  body: string;
  startTime: string;
  delayMs: number;
  hourlyLimit: number;
  createdAt: string;
  updatedAt: string;
}

export interface Email {
  id: string;
  campaignId: string;
  senderId: string;
  recipient: string;
  subject: string;
  body: string;
  scheduledAt: string;
  sentAt?: string;
  status: 'SCHEDULED' | 'PROCESSING' | 'SENT' | 'FAILED';
  bullJobId: string;
  attempts: number;
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
  sender?: Sender;
  campaign?: Campaign;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface SlackConnection {
  id: string;
  userId: string;
  slackUserId?: string;
  teamId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ScheduleCampaignRequest {
  subject: string;
  body: string;
  startTime: string;
  delayMs: number;
  hourlyLimit: number;
  senderId: string;
  recipients: string[];
}
