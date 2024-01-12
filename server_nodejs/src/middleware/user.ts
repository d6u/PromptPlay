import { PlaceholderUserEntity } from 'dynamodb-models/placeholder-user.js';
import { UserEntity } from 'dynamodb-models/user.js';
import { NextFunction, Response } from 'express';
import { RequestWithSession } from '../types.js';

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
  let dbUser: DbUserShape | null = null;

  const userId = req.session!.userId;

  if (userId != null) {
    const { Item: user } = await UserEntity.get({ id: userId });

    if (user != null) {
      dbUser = {
        id: user.id,
        isPlaceholderUser: false,
      };
    } else {
      delete req.session!.userId;
    }
  }

  if (dbUser == null) {
    const placeholderUserToken = req.session!.placeholderUserToken;

    if (placeholderUserToken != null) {
      const { Item: user } = await PlaceholderUserEntity.get({
        placeholderClientToken: placeholderUserToken,
      });

      if (user != null) {
        dbUser = {
          id: user.placeholderClientToken,
          isPlaceholderUser: true,
        };
      } else {
        delete req.session!.placeholderUserToken;
      }
    }
  }

  if (dbUser != null) {
    req.dbUser = dbUser;
  }

  next();
}
