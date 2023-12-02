import {
  AttributeValue,
  GetItemCommand,
  PutItemCommand,
  UpdateItemCommand,
} from "@aws-sdk/client-dynamodb";
import Belt from "@mobily/ts-belt";
import invariant from "ts-invariant";
import { v4 as uuidv4 } from "uuid";
import dynamoDbClient from "../dynamoDb.js";
import { nullThrow } from "../utils.js";
import { asUUID, UUID } from "./types.js";

export default class OrmSpace {
  static async findById(id: string): Promise<OrmSpace | null> {
    const response = await dynamoDbClient.send(
      new GetItemCommand({
        TableName: process.env.TABLE_NAME_SPACES,
        Key: {
          Id: { S: id },
        },
      }),
    );

    if (!response.Item) {
      return null;
    }

    const dbSpace = new OrmSpace({
      id: asUUID(id),
      name: nullThrow(response.Item.Name?.S),
      contentVersion: nullThrow(
        response.Item.ContentVersion?.S,
      ) as OrmContentVersion,
      contentV2: response.Item.ContentV2?.S ?? null,
      contentV3: response.Item.ContentV3?.S ?? null,
      ownerId: asUUID(nullThrow(response.Item.OwnerId?.S)),
    });

    dbSpace.isNew = false;

    return dbSpace;
  }

  constructor({
    id,
    name,
    contentVersion,
    contentV2,
    contentV3,
    ownerId,
  }: {
    id?: UUID;
    name?: string;
    contentVersion?: OrmContentVersion;
    contentV2?: string | null;
    contentV3?: string | null;
    ownerId?: UUID;
  }) {
    this.id = id;
    this.name = name;
    this.contentVersion = contentVersion;
    this.contentV2 = contentV2;
    this.contentV3 = contentV3;
    this.ownerId = ownerId;
  }

  id?: UUID;
  name?: string;
  contentVersion?: OrmContentVersion;
  contentV2?: string | null;
  contentV3?: string | null;
  // Relationships
  ownerId?: UUID;

  private isNew: boolean = true;

  async save() {
    if (this.isNew) {
      this.id = this.id ?? asUUID(uuidv4());

      this.validateFields();

      await dynamoDbClient.send(
        new PutItemCommand({
          TableName: process.env.TABLE_NAME_SPACES,
          Item: this.buildItem(),
        }),
      );

      this.isNew = false;
    } else {
      this.validateFields();

      const { updateExpression, expressionAttributeValues } =
        this.buildUpdateExpressionAndExpressionAttributeValues();

      await dynamoDbClient.send(
        new UpdateItemCommand({
          TableName: process.env.TABLE_NAME_SPACES,
          Key: {
            Id: { S: this.id! },
          },
          UpdateExpression: updateExpression,
          ExpressionAttributeValues: expressionAttributeValues,
          ReturnValues: "NONE",
        }),
      );
    }
  }

  private validateFields() {
    invariant(this.id !== undefined, "id is required");
    invariant(this.name !== undefined, "name is required");
    invariant(this.contentVersion !== undefined, "contentVersion is required");
    invariant(this.contentV2 !== undefined, "contentV2 is required");
    invariant(this.contentV3 !== undefined, "contentV3 is required");
    invariant(this.ownerId !== undefined, "ownerId is required");
  }

  /**
   * This method will assume all fields are validated.
   */
  private buildUpdateExpressionAndExpressionAttributeValues(): {
    updateExpression: string;
    expressionAttributeValues: Record<string, AttributeValue>;
  } {
    const item = this.buildItem();

    const updateExpressionPairs: [string, string, AttributeValue][] =
      Object.keys(item).map((key) => {
        return [
          `${key} = :${key}`,
          `:${key}`,
          item[key as keyof typeof item] as AttributeValue,
        ];
      });

    const updateExpression =
      "SET " + updateExpressionPairs.map((pair) => pair[0]).join(", ");
    const expressionAttributeValues = Belt.D.fromPairs(
      updateExpressionPairs.map((pair) => [pair[1], pair[2]]),
    );

    return {
      updateExpression,
      expressionAttributeValues,
    };
  }

  /**
   * This method will assume all fields are validated.
   */
  private buildItem(): Record<string, AttributeValue> {
    return {
      Id: { S: this.id! },
      Name: { S: this.name! },
      ContentVersion: { S: this.contentVersion! },
      ...(this.contentV2 !== null && {
        ContentV2: { S: this.contentV2! },
      }),
      ...(this.contentV3 !== null && {
        ContentV3: { S: this.contentV3! },
      }),
      OwnerId: { S: this.ownerId! },
    };
  }
}

export enum OrmContentVersion {
  v1 = "v1",
  v2 = "v2",
  v3 = "v3",
}
