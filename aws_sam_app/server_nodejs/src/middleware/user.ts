import { NextFunction, Response } from "express";
import OrmUser from "../models/user.js";
import { RequestWithSession } from "../types.js";

export interface RequestWithUser extends RequestWithSession {
  user?: {
    userId: string;
    name: string;
    idToken?: string;
  };
}

export async function attachUser(
  req: RequestWithUser,
  _res: Response,
  next: NextFunction,
) {
  const userId = req.session?.userId;

  if (!userId) {
    next();
    return;
  }

  const dbUser = await OrmUser.findById(userId);

  if (!dbUser) {
    next();
    return;
  }

  req.user = {
    userId: dbUser.id!,
    name: dbUser.name ?? "",
    idToken: dbUser.auth0UserId ?? "",
  };

  next();
}
