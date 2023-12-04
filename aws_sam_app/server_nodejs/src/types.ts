import { Request } from "express";

interface CustomCookieSessionObject
  extends CookieSessionInterfaces.CookieSessionObject {
  userId?: string;
  nonce?: string;
  idToken?: string;
}

export interface RequestWithSession extends Request {
  session?: CustomCookieSessionObject | null;
}
