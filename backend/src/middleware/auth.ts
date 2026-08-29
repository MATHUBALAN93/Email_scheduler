import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

declare module 'express-session' {
  interface SessionData {
    user?: {
      id: string;
      email: string;
      name: string;
      googleId: string;
    };
  }
}

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
    googleId: string;
  };
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.session?.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  req.user = req.session.user;
  next();
};
