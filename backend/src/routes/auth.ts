import { Router } from 'express';
import { authController } from '../controllers/authController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Email/Password Registration
router.post('/register', authController.register);

// Email/Password Login
router.post('/login', authController.loginWithEmail);

// Session
router.get('/me', authMiddleware, authController.getMe);

router.post('/logout', authMiddleware, authController.logout);

export { router as authRoutes };