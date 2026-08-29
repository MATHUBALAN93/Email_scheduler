import { prisma } from '../utils/database';
import { ScheduleCampaignDto } from '../types';

export class CampaignRepository {
  async findById(id: string) {
    return prisma.campaign.findUnique({
      where: { id },
      include: {
        user: true,
        emails: true,
      },
    });
  }

  async findByUserId(userId: string) {
    return prisma.campaign.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { emails: true },
        },
      },
    });
  }

  async create(userId: string, data: Omit<ScheduleCampaignDto, 'recipients'>) {
    return prisma.campaign.create({
      data: {
        userId,
        ...data,
      },
    });
  }

  async update(id: string, data: Partial<{
    subject: string;
    body: string;
    startTime: Date;
    delayMs: number;
    hourlyLimit: number;
  }>) {
    return prisma.campaign.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return prisma.campaign.delete({
      where: { id },
    });
  }
}
