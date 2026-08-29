import { prisma } from '../utils/database';
import { EmailStatus } from '@prisma/client';
import { CreateEmailDto, PaginationParams } from '../types';

export class EmailRepository {
  async create(data: CreateEmailDto & { bullJobId: string }) {
    return prisma.email.create({
      data,
      include: {
        sender: true,
        campaign: true,
      },
    });
  }

  async findById(id: string) {
    return prisma.email.findUnique({
      where: { id },
      include: {
        sender: true,
        campaign: true,
      },
    });
  }

  async findByBullJobId(bullJobId: string) {
    return prisma.email.findUnique({
      where: { bullJobId },
      include: {
        sender: true,
        campaign: true,
      },
    });
  }

  async findByCampaignId(campaignId: string, params?: PaginationParams) {
    const page = params?.page || 1;
    const limit = params?.limit || 10;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      prisma.email.findMany({
        where: { campaignId },
        include: {
          sender: true,
        },
        orderBy: { scheduledAt: 'asc' },
        skip,
        take: limit,
      }),
      prisma.email.count({ where: { campaignId } }),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findByUserId(userId: string, status: EmailStatus, params?: PaginationParams) {
    const page = params?.page || 1;
    const limit = params?.limit || 10;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      prisma.email.findMany({
        where: {
          campaign: { userId },
          status,
        },
        include: {
          sender: true,
          campaign: true,
        },
        orderBy: { scheduledAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.email.count({
        where: {
          campaign: { userId },
          status,
        },
      }),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async updateStatus(id: string, status: EmailStatus, sentAt?: Date, errorMessage?: string) {
    return prisma.email.update({
      where: { id },
      data: {
        status,
        sentAt,
        errorMessage,
        attempts: { increment: 1 },
      },
    });
  }

  async updateBullJobId(id: string, bullJobId: string) {
    return prisma.email.update({
      where: { id },
      data: { bullJobId },
    });
  }

  async createWithoutBullJobId(data: Omit<CreateEmailDto, 'bullJobId'>) {
    return prisma.email.create({
      data: {
        ...data,
        bullJobId: '', // Temporary empty string
      },
      include: {
        sender: true,
        campaign: true,
      },
    });
  }

  async updateStatusAtomically(id: string, fromStatus: EmailStatus, toStatus: EmailStatus) {
    return prisma.email.updateMany({
      where: {
        id,
        status: fromStatus,
      },
      data: {
        status: toStatus,
        attempts: { increment: 1 },
      },
    });
  }

  async countBySenderAndStatus(senderId: string, status: EmailStatus) {
    return prisma.email.count({
      where: {
        senderId,
        status,
      },
    });
  }
}
