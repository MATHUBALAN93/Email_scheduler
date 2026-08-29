import { prisma } from '../utils/database';

export class UserRepository {
  async findByGoogleId(googleId: string) {
    return prisma.user.findUnique({
      where: { googleId },
    });
  }

  async findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  async findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      include: {
        senders: true,
        slackConnections: true,
      },
    });
  }

  async create(data: {
    googleId: string;
    name: string;
    email: string;
    avatarUrl?: string;
  }) {
    return prisma.user.create({
      data,
    });
  }

  async update(id: string, data: Partial<{ name: string; avatarUrl: string }>) {
    return prisma.user.update({
      where: { id },
      data,
    });
  }
}
