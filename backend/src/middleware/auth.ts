import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { config } from '../config';
import jwt from 'jsonwebtoken';
import '../types/express'; // Import type declarations

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    const decoded = jwt.verify(token, config.jwt.secret) as any;
    
    req.user = {
      id: decoded.id,
      email: decoded.email,
      name: decoded.name,
      googleId: undefined,
    };
    
    next();
  } catch (error) {
    logger.error({ error }, 'Authentication failed');
    return res.status(401).json({ error: 'Unauthorized' });
  }
};
