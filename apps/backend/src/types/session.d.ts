import 'express-session';

declare module 'express-session' {
  interface SessionData {
    csrfToken?: string;
    user?: {
      id: string;
      email: string;
      role: string;
    };
  }
}
