import { NextFunction, Response } from "express";
import OrmUser from "../models/user.js";
import { RequestWithSession } from "../types.js";

export interface RequestWithUser extends RequestWithSession {
  dbUser?: OrmUser;
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

  req.dbUser = dbUser;

  next();
}
