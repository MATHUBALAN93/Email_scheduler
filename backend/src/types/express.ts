import 'express';
import 'express-session';

declare module 'express-session' {
  interface SessionData {
    user?: {
      id: string;
      email: string;
      name: string;
      googleId?: string;
    };
  }
}

declare global {
  namespace Express {
    interface User {
      id: string;
      email: string;
      name: string;
      googleId?: string;
    }

    interface Request {
      user?: User;
    }
  }
}