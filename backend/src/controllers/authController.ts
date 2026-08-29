import { Response, NextFunction, Request } from 'express';
import { UserRepository } from '../repositories/userRepository';
import { logger } from '../utils/logger';
import '../types/express'; // Import type declarations

const userRepository = new UserRepository();

export const authController = {
  async getMe(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const user = await userRepository.findById(req.user.id);
      if (!user) {
        req.session.destroy(() => {});
        return res.status(401).json({ error: 'User not found' });
      }

      res.json({
        id: user.id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
      });
    } catch (error) {
      logger.error({ error }, 'Error fetching user');
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  async logout(req: Request, res: Response, next: NextFunction) {
    req.session?.destroy((err) => {
      if (err) {
        logger.error({ error: err }, 'Error destroying session');
        return res.status(500).json({ error: 'Failed to logout' });
      }
      res.json({ message: 'Logged out successfully' });
    });
  },
};
