import { Router } from 'express';
import { senderController } from '../controllers/senderController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// All sender routes require authentication
router.use(authMiddleware);

router.get('/', senderController.getSenders);
router.post('/', senderController.createSender);
router.delete('/:id', senderController.deleteSender);

export { router as senderRoutes };
