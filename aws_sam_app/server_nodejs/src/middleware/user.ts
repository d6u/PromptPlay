import { NextFunction, Response } from "express";
import { UserEntity, UserShape } from "../models/user.js";
import { RequestWithSession } from "../types.js";

export interface RequestWithUser extends RequestWithSession {
  dbUser?: UserShape;
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

  const { Item: dbUser } = await UserEntity.get({ id: userId });

  if (dbUser == null) {
    next();
    return;
  }

  req.dbUser = dbUser;

  next();
}
