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
    session: false,
  }),
  (req, res) => {
    if (!req.user) {
      return res.redirect(`${config.frontend.url}/login`);
    }
    
    // Generate JWT token for Google OAuth user
    const jwt = require('jsonwebtoken');
    const token = jwt.sign(
      { id: req.user.id, email: req.user.email, name: req.user.name },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );
    
    // Redirect to frontend with token in URL
    res.redirect(`${config.frontend.url}/dashboard?token=${token}`);
  }
);

// Email/Password Registration
router.post('/register', authController.register);

// Email/Password Login
router.post('/login', authController.loginWithEmail);

// Session
router.get('/me', authMiddleware, authController.getMe);

router.post('/logout', authMiddleware, authController.logout);

export { router as authRoutes };