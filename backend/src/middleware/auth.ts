import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import '../types/express'; // Import type declarations

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (!req.session?.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  req.user = req.session.user;
  next();
};
