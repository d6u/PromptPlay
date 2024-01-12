import { Request } from 'express';

interface CustomCookieSessionObject
  extends CookieSessionInterfaces.CookieSessionObject {
  userId?: string;
  nonce?: string;
  placeholderUserToken?: string;
  sessionId?: string;
}

export interface RequestWithSession extends Request {
  session?: CustomCookieSessionObject | null;
}
