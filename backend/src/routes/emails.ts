import { Router } from 'express';
import { emailController } from '../controllers/emailController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// All email routes require authentication
router.use(authMiddleware);

router.post('/schedule', emailController.scheduleCampaign);
router.get('/scheduled', emailController.getScheduledEmails);
router.get('/sent', emailController.getSentEmails);
router.get('/search', emailController.searchEmails);
router.get('/:id', emailController.getEmailById);

export { router as emailRoutes };
