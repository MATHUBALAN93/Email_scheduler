import { prisma } from '../utils/database';

export class SlackRepository {
  async findByUserId(userId: string) {
    return prisma.slackConnection.findFirst({
      where: { userId },
    });
  }

  async findById(id: string) {
    return prisma.slackConnection.findUnique({
      where: { id },
      include: {
        user: true,
      },
    });
  }

  async create(data: {
    userId: string;
    slackUserId?: string;
    teamId?: string;
    accessToken: string;
  }) {
    return prisma.slackConnection.create({
      data,
    });
  }

  async update(id: string, data: Partial<{
    slackUserId: string;
    teamId: string;
    accessToken: string;
  }>) {
    return prisma.slackConnection.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return prisma.slackConnection.delete({
      where: { id },
    });
  }

  async deleteByUserId(userId: string) {
    return prisma.slackConnection.deleteMany({
      where: { userId },
    });
  }
}
