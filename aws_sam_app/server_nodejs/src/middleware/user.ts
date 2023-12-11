import { NextFunction, Response } from "express";
import { PlaceholderUserEntity } from "../models/placeholder-user.js";
import { UserEntity } from "../models/user.js";
import { RequestWithSession } from "../types.js";

type DbUserShape = {
  id: string;
  isPlaceholderUser: boolean;
};

export interface RequestWithUser extends RequestWithSession {
  dbUser?: DbUserShape;
}

export async function attachUser(
  req: RequestWithUser,
  _res: Response,
  next: NextFunction,
) {
  const userId = req.session?.userId;

  if (userId != null) {
    const { Item: dbUser } = await UserEntity.get({ id: userId });

    if (dbUser != null) {
      req.dbUser = {
        id: dbUser.id,
        isPlaceholderUser: false,
      };
      next();
      return;
    }

    req.session = null;
  }

  // NOTE: This header name is in lower cases.
  const placeholderUserToken = req.header("placeholderusertoken");

  if (placeholderUserToken != null) {
    const { Item: dbPlaceholderUser } = await PlaceholderUserEntity.get({
      placeholderClientToken: placeholderUserToken,
    });

    if (dbPlaceholderUser != null) {
      req.dbUser = {
        id: dbPlaceholderUser.placeholderClientToken,
        isPlaceholderUser: true,
      };
      next();
      return;
    }
  }

  next();
}
