import { Router, Request, Response, NextFunction } from 'express';
import { emailController } from '../controllers/emailController';
import { authMiddleware } from '../middleware/auth';
import '../types/express'; // Import type declarations

const router = Router();

// All email routes require authentication
router.use(authMiddleware);

router.post('/schedule', (req: Request, res: Response, next: NextFunction) => emailController.scheduleCampaign(req, res, next));
router.get('/scheduled', (req: Request, res: Response, next: NextFunction) => emailController.getScheduledEmails(req, res, next));
router.get('/sent', (req: Request, res: Response, next: NextFunction) => emailController.getSentEmails(req, res, next));
router.get('/search', (req: Request, res: Response, next: NextFunction) => emailController.searchEmails(req, res, next));
router.get('/:id', (req: Request, res: Response, next: NextFunction) => emailController.getEmailById(req, res, next));

export { router as emailRoutes };
