import { GetItemCommand } from "@aws-sdk/client-dynamodb";
import dynamoDbClient from "../dynamoDb.js";

export default class OrmUser {
  static async findById(id: string): Promise<OrmUser | null> {
    const response = await dynamoDbClient.send(
      new GetItemCommand({
        TableName: process.env.TABLE_NAME_USERS,
        Key: {
          UserId: { S: id },
        },
      }),
    );

    if (!response.Item) {
      return null;
    }

    return new OrmUser(
      id,
      response.Item.Email.S ?? null,
      response.Item.Picture.S ?? null,
    );
  }

  constructor(
    public id: string,
    public email: string | null,
    public profilePictureUrl: string | null,
  ) {}
}
