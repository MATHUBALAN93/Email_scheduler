import { prisma } from '../utils/database';
import * as bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

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

  async createWithPassword(data: {
    email: string;
    password: string;
    name: string;
    avatarUrl?: string;
  }) {
    const hashedPassword = await bcrypt.hash(data.password, SALT_ROUNDS);
    return prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        name: data.name,
        avatarUrl: data.avatarUrl,
      },
    });
  }

  async verifyPassword(user: any, password: string): Promise<boolean> {
    if (!user.password) return false;
    return bcrypt.compare(password, user.password);
  }

  async update(id: string, data: Partial<{ name: string; avatarUrl: string }>) {
    return prisma.user.update({
      where: { id },
      data,
    });
  }
}
