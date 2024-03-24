import { prismaClient, User } from 'database-models';
import { NextFunction, Response } from 'express';
import { RequestWithSession } from '../types';

export interface RequestWithUser extends RequestWithSession {
  user?: User;
}

async function attachUser(
  req: RequestWithUser,
  _res: Response,
  next: NextFunction,
) {
  let user: User | null = null;

  const userId = req.session!.userId;

  if (userId != null) {
    user = await prismaClient.user.findUnique({ where: { id: userId } });

    if (user == null) {
      delete req.session!.userId;
    }
  }

  if (user == null) {
    const placeholderUserToken = req.session!.placeholderUserToken;

    if (placeholderUserToken != null) {
      user = await prismaClient.user.findUnique({
        where: { placeholderClientToken: placeholderUserToken },
      });

      if (user == null) {
        delete req.session!.placeholderUserToken;
      }
    }
  }

  if (user != null) {
    req.user = user;
  }

  next();
}

export default attachUser;
