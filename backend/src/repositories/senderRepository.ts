import { prisma } from '../utils/database';

export class SenderRepository {
  async findById(id: string) {
    return prisma.sender.findUnique({
      where: { id },
      include: {
        user: true,
      },
    });
  }

  async findByUserId(userId: string) {
    return prisma.sender.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(data: {
    userId: string;
    email: string;
    smtpHost: string;
    smtpPort: number;
    smtpUser: string;
    smtpPassword: string;
  }) {
    return prisma.sender.create({
      data,
    });
  }

  async update(id: string, data: Partial<{
    email: string;
    smtpHost: string;
    smtpPort: number;
    smtpUser: string;
    smtpPassword: string;
  }>) {
    return prisma.sender.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return prisma.sender.delete({
      where: { id },
    });
  }
}
