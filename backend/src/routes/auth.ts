import { Router } from 'express';
import passport from 'passport';
import { authController } from '../controllers/authController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Google OAuth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: `${process.env.FRONTEND_URL}/login` }),
  (req, res) => {
    res.redirect(`${process.env.FRONTEND_URL}/dashboard`);
  }
);

// Session management
router.get('/me', authMiddleware, authController.getMe);
router.post('/logout', authController.logout);

export { router as authRoutes };
