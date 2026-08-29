import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { UserRepository } from '../repositories/userRepository';
import { config } from './index';
import { logger } from '../utils/logger';

const userRepository = new UserRepository();

passport.use(
  new GoogleStrategy(
    {
      clientID: config.google.clientId,
      clientSecret: config.google.clientSecret,
      callbackURL: config.google.callbackUrl,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const googleId = profile.id;
        const email = profile.emails?.[0]?.value;
        const name = profile.displayName;
        const avatarUrl = profile.photos?.[0]?.value;

        if (!email) {
          return done(new Error('No email in Google profile'));
        }

        let user = await userRepository.findByGoogleId(googleId);

        if (!user) {
          user = await userRepository.create({
            googleId,
            email,
            name,
            avatarUrl,
          });
          logger.info({ userId: user.id }, 'New user created via Google OAuth');
        } else {
          // Update user info if changed
          if (user.name !== name || user.avatarUrl !== avatarUrl) {
            user = await userRepository.update(user.id, { name, avatarUrl });
          }
        }

        return done(null, user);
      } catch (error) {
        logger.error({ error }, 'Error in Google OAuth strategy');
        return done(error);
      }
    }
  )
);

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await userRepository.findById(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});

export { passport };
