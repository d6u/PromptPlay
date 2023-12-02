import {
  AttributeValue,
  GetItemCommand,
  PutItemCommand,
  UpdateItemCommand,
} from "@aws-sdk/client-dynamodb";
import invariant from "tiny-invariant";
import { v4 as uuidv4 } from "uuid";
import dynamoDbClient from "../dynamoDb.js";
import { nullThrow } from "../utils.js";
import { asUUID, UUID } from "./types.js";
import { buildUpdateExpressionFieldsFromItem } from "./utils.js";

export default class OrmUser {
  static async findById(id: string): Promise<OrmUser | null> {
    const response = await dynamoDbClient.send(
      new GetItemCommand({
        TableName: process.env.TABLE_NAME_USERS,
        Key: {
          Id: { S: id },
        },
      }),
    );

    if (!response.Item) {
      return null;
    }

    const dbUser = new OrmUser({
      id: asUUID(id),
      isUserPlaceholder: nullThrow(response.Item.IsUserPlaceholder?.BOOL),
      name: nullThrow(response.Item.Name?.S),
      email: response.Item.Email?.S ?? null,
      profilePictureUrl: response.Item.ProfilePictureUrl?.S ?? null,
      auth0UserId: response.Item.Auth0UserId?.S ?? null,
      placeholderClientToken:
        response.Item.PlaceholderClientToken?.S == null
          ? null
          : asUUID(response.Item.PlaceholderClientToken.S),
    });

    dbUser.isNew = false;

    return dbUser;
  }

  constructor({
    id,
    isUserPlaceholder,
    name,
    email,
    profilePictureUrl,
    auth0UserId,
    placeholderClientToken,
  }: {
    id?: UUID;
    isUserPlaceholder?: boolean;
    name?: string | null;
    email?: string | null;
    profilePictureUrl?: string | null;
    auth0UserId?: string | null;
    placeholderClientToken?: UUID | null;
  }) {
    this.id = id;
    this.isUserPlaceholder = isUserPlaceholder;
    this.name = name;
    this.email = email;
    this.profilePictureUrl = profilePictureUrl;
    this.auth0UserId = auth0UserId;
    this.placeholderClientToken = placeholderClientToken;
  }

  id?: UUID;
  isUserPlaceholder?: boolean;
  name?: string | null;
  email?: string | null;
  profilePictureUrl?: string | null;
  auth0UserId?: string | null;
  placeholderClientToken?: UUID | null;

  private isNew: boolean = true;

  async save() {
    if (this.isNew) {
      this.id = this.id ?? asUUID(uuidv4());

      this.validateFields();

      await dynamoDbClient.send(
        new PutItemCommand({
          TableName: process.env.TABLE_NAME_USERS,
          Item: this.buildItem(),
        }),
      );

      this.isNew = false;
    } else {
      this.validateFields();

      const item = this.buildItem();

      const {
        updateExpression,
        expressionAttributeNames,
        expressionAttributeValues,
      } = buildUpdateExpressionFieldsFromItem(item);

      await dynamoDbClient.send(
        new UpdateItemCommand({
          TableName: process.env.TABLE_NAME_USERS,
          Key: {
            Id: { S: this.id! },
          },
          UpdateExpression: updateExpression,
          ExpressionAttributeNames: expressionAttributeNames,
          ExpressionAttributeValues: expressionAttributeValues,
          ReturnValues: "NONE",
        }),
      );
    }
  }

  private validateFields() {
    invariant(this.id !== undefined, "id is required");
    invariant(this.name !== undefined, "name is required");
    invariant(this.email !== undefined, "email is required");
    invariant(
      this.profilePictureUrl !== undefined,
      "profilePictureUrl is required",
    );
    invariant(this.auth0UserId !== undefined, "auth0UserId is required");
    invariant(
      this.isUserPlaceholder !== undefined,
      "isUserPlaceholder is required",
    );
    invariant(
      this.placeholderClientToken !== undefined,
      "placeholderClientToken is required",
    );
  }

  /**
   * This method will assume all fields are validated.
   */
  private buildItem(): Record<string, AttributeValue> {
    return {
      ...(this.isNew && { Id: { S: this.id! } }),
      IsUserPlaceholder: { BOOL: this.isUserPlaceholder! },
      ...(this.name !== null && {
        Name: { S: this.name! },
      }),
      ...(this.email !== null && {
        Email: { S: this.email! },
      }),
      ...(this.profilePictureUrl !== null && {
        ProfilePictureUrl: { S: this.profilePictureUrl! },
      }),
      ...(this.auth0UserId !== null && {
        Auth0UserId: { S: this.auth0UserId! },
      }),
      ...(this.placeholderClientToken !== null && {
        PlaceholderClientToken: { S: this.placeholderClientToken! },
      }),
    };
  }
}
