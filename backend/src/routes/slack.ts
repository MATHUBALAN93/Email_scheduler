import { Router, Request, Response, NextFunction } from 'express';
import { slackController } from '../controllers/slackController';
import { authMiddleware } from '../middleware/auth';
import '../types/express'; // Import type declarations

const router = Router();

// Connect requires auth to get user ID
router.get('/connect', authMiddleware, (req: Request, res: Response, next: NextFunction) => slackController.connect(req, res, next));

// Callback requires auth to store connection
router.get('/callback', authMiddleware, (req: Request, res: Response, next: NextFunction) => slackController.callback(req, res, next));

// Status and disconnect require auth
router.get('/status', authMiddleware, (req: Request, res: Response, next: NextFunction) => slackController.getStatus(req, res, next));
router.post('/disconnect', authMiddleware, (req: Request, res: Response, next: NextFunction) => slackController.disconnect(req, res, next));

export { router as slackRoutes };
