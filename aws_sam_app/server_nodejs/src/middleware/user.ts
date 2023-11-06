import { GetItemCommand } from "@aws-sdk/client-dynamodb";
import { Response, NextFunction } from "express";
import dynamoDbClient from "../dynamoDb.js";
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
  next: NextFunction
) {
  const userId = req.session?.userId;

  if (!userId) {
    next();
    return;
  }

  const response = await dynamoDbClient.send(
    new GetItemCommand({
      TableName: process.env.TABLE_NAME_USERS,
      Key: {
        UserId: { S: userId },
      },
    })
  );

  if (!response.Item?.Name?.S) {
    next();
    return;
  }

  req.user = {
    userId,
    name: response.Item.Name.S,
    idToken: response.Item.IdToken.S,
  };

  next();
}
