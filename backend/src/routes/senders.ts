import { Router, Request, Response, NextFunction } from 'express';
import { senderController } from '../controllers/senderController';
import { authMiddleware } from '../middleware/auth';
import '../types/express'; // Import type declarations

const router = Router();

// All sender routes require authentication
router.use(authMiddleware);

router.get('/', (req: Request, res: Response, next: NextFunction) => senderController.getSenders(req, res, next));
router.post('/', (req: Request, res: Response, next: NextFunction) => senderController.createSender(req, res, next));
router.delete('/:id', (req: Request, res: Response, next: NextFunction) => senderController.deleteSender(req, res, next));

export { router as senderRoutes };
