import { NextFunction, Response } from "express";
import { UserEntity, UserShape, UsersTable } from "../models/user.js";
import { RequestWithSession } from "../types.js";
import { nullThrow } from "../utils.js";

export interface RequestWithUser extends RequestWithSession {
  dbUser?: UserShape;
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
      req.dbUser = dbUser;
      next();
      return;
    }

    req.session = null;
  }

  // NOTE: Header name is in lower cases.
  const placeholderUserToken = req.header("placeholderusertoken");

  if (placeholderUserToken != null) {
    const response = await UsersTable.query(placeholderUserToken, {
      index: "PlaceholderClientTokenIndex",
      limit: 1,
    });

    if (response.Items?.length === 1) {
      const { Item: dbUser } = await UserEntity.get({
        id: response.Items[0]!["Id"],
      });

      req.dbUser = nullThrow(dbUser);
      next();
      return;
    }
  }

  next();
}
