import {
  GetItemCommand,
  PutItemCommand,
  UpdateItemCommand,
} from "@aws-sdk/client-dynamodb";
import { v4 as uuidv4 } from "uuid";
import dynamoDbClient from "../dynamoDb.js";
import { asUUID, UUID } from "./types.js";

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

    return new OrmUser({
      id: asUUID(id),
      // NOTE: Use || instead of ?? because we set these value to empty string
      // instead of null.
      name: response.Item.Name.S || null,
      email: response.Item.Email.S || null,
      profilePictureUrl: response.Item.ProfilePictureUrl.S || null,
      auth0UserId: response.Item.Auth0UserId.S || null,
      isUserPlaceholder: response.Item.IsUserPlaceholder.BOOL!,
    });
  }

  constructor({
    id,
    name,
    email,
    profilePictureUrl,
    auth0UserId,
    isUserPlaceholder,
  }: {
    id?: UUID;
    name: string | null;
    email: string | null;
    profilePictureUrl: string | null;
    auth0UserId: string | null;
    isUserPlaceholder: boolean;
  }) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.profilePictureUrl = profilePictureUrl;
    this.auth0UserId = auth0UserId;
    this.isUserPlaceholder = isUserPlaceholder;
  }

  id?: UUID;
  name: string | null;
  email: string | null;
  profilePictureUrl: string | null;
  auth0UserId: string | null;
  isUserPlaceholder: boolean;

  async save() {
    if (!this.id) {
      this.id = asUUID(uuidv4());

      await dynamoDbClient.send(
        new PutItemCommand({
          TableName: process.env.TABLE_NAME_USERS,
          Item: {
            UserId: { S: this.id },
            Name: { S: this.name ?? "" },
            Email: { S: this.email ?? "" },
            ProfilePictureUrl: { S: this.profilePictureUrl ?? "" },
            Auth0UserId: { S: this.auth0UserId ?? "" },
            IsUserPlaceholder: { BOOL: this.isUserPlaceholder },
          },
        }),
      );
    } else {
      await dynamoDbClient.send(
        new UpdateItemCommand({
          TableName: process.env.TABLE_NAME_USERS,
          Key: {
            UserId: { S: this.id },
          },
          UpdateExpression: `SET #Name = :Name, #Email = :Email, #ProfilePictureUrl = :ProfilePictureUrl, #Auth0UserId = :Auth0UserId, #IsUserPlaceholder = :IsUserPlaceholder`,
          ExpressionAttributeNames: {
            "#Name": "Name",
            "#Email": "Email",
            "#ProfilePictureUrl": "ProfilePictureUrl",
            "#Auth0UserId": "Auth0UserId",
            "#IsUserPlaceholder": "IsUserPlaceholder",
          },
          ExpressionAttributeValues: {
            ":Name": { S: this.name ?? "" },
            ":Email": { S: this.email ?? "" },
            ":ProfilePictureUrl": { S: this.profilePictureUrl ?? "" },
            ":Auth0UserId": { S: this.auth0UserId ?? "" },
            ":IsUserPlaceholder": { BOOL: this.isUserPlaceholder },
          },
          ReturnValues: "NONE",
        }),
      );
    }
  }
}
