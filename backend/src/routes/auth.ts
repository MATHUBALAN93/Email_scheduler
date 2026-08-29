import { Router } from 'express';
import passport from 'passport';
import { authController } from '../controllers/authController';
import { authMiddleware } from '../middleware/auth';
import { config } from '../config';

const router = Router();

// Google OAuth
router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
  })
);

// Google OAuth callback
router.get(
  '/google/callback',
  passport.authenticate('google', {
    failureRedirect: `${config.frontend.url}/login`,
  }),
  (req, res) => {
    res.redirect(`${config.frontend.url}/dashboard`);
  }
);

// Session
router.get('/me', authMiddleware, authController.getMe);

router.post('/logout', authMiddleware, authController.logout);

export { router as authRoutes };