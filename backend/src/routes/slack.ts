import { Router } from 'express';
import { slackController } from '../controllers/slackController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Connect requires auth to get user ID
router.get('/connect', authMiddleware, slackController.connect);

// Callback requires auth to store connection
router.get('/callback', authMiddleware, slackController.callback);

// Status and disconnect require auth
router.get('/status', authMiddleware, slackController.getStatus);
router.post('/disconnect', authMiddleware, slackController.disconnect);

export { router as slackRoutes };
