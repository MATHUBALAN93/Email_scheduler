import { Response, NextFunction, Request } from 'express';
import { UserRepository } from '../repositories/userRepository';
import { logger } from '../utils/logger';
import { config } from '../config';
import jwt from 'jsonwebtoken';
import '../types/express'; // Import type declarations

const userRepository = new UserRepository();

const generateToken = (userId: string, email: string, name: string) => {
  const expiresIn = config.jwt.expiresIn;
  return jwt.sign(
    { id: userId, email, name },
    config.jwt.secret,
    { expiresIn } as any
  );
};

export const authController = {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password, name } = req.body;

      if (!email || !password || !name) {
        return res.status(400).json({ error: 'Email, password, and name are required' });
      }

      // Check if user already exists
      const existingUser = await userRepository.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: 'User already exists' });
      }

      // Create user with hashed password
      const user = await userRepository.createWithPassword({
        email,
        password,
        name,
      });

      // Generate JWT token
      const token = generateToken(user.id, user.email, user.name);

      logger.info({ userId: user.id }, 'New user registered via email/password');

      res.json({
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          avatarUrl: user.avatarUrl,
        },
      });
    } catch (error) {
      logger.error({ error }, 'Error in registration');
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  async loginWithEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      const user = await userRepository.findByEmail(email);
      if (!user || !user.password) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const isValidPassword = await userRepository.verifyPassword(user, password);
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Generate JWT token
      const token = generateToken(user.id, user.email, user.name);

      logger.info({ userId: user.id }, 'User logged in via email/password');

      res.json({
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          avatarUrl: user.avatarUrl,
        },
      });
    } catch (error) {
      logger.error({ error }, 'Error in email login');
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  async getMe(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const user = await userRepository.findById(req.user.id);
      if (!user) {
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
    // For JWT, logout is mainly client-side (remove token)
    res.json({ message: 'Logged out successfully' });
  },
};
