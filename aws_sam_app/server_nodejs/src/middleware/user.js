import { GetItemCommand } from "@aws-sdk/client-dynamodb";
import dynamoDbClient from "../dynamoDb.js";

export async function attachUser(req, res, next) {
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
