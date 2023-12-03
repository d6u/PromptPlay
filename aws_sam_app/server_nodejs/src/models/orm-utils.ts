import {
  AttributeValue,
  GetItemCommand,
  PutItemCommand,
  UpdateItemCommand,
} from "@aws-sdk/client-dynamodb";
import { v4 as uuidv4 } from "uuid";
import dynamoDbClient from "../dynamoDb.js";
import { asUUID, UUID } from "./types.js";
import {
  buildUpdateExpressionFieldsFromItem,
  undefinedThrow,
} from "./utils.js";

type Config<T> = {
  table: string;
  shape: Record<keyof T, FieldSettings>;
};

type FieldSettings = {
  type: "string" | "boolean";
  nullable: boolean;
  fieldName: string;
};

type OrmShape<T> = {
  [Property in keyof T]: T[Property];
} & {
  updatedAt: string;
  createdAt: string;
};

interface WithId {
  id: UUID;
}

export function createOrmClass<S extends WithId>(config: Config<S>) {
  type OrmInstance = OrmClass & OrmShape<S>;

  class OrmClass {
    static async findById(id: string): Promise<OrmInstance | null> {
      const response = await dynamoDbClient.send(
        new GetItemCommand({
          TableName: config.table,
          Key: {
            Id: { S: id },
          },
        }),
      );

      if (!response.Item) {
        return null;
      }

      const obj = OrmClass.buildObject(response.Item);

      const dbInstance = new OrmClass(obj);
      dbInstance.isNew = false;

      return dbInstance as OrmInstance;
    }

    private static validateFields(data: Partial<S>): asserts data is S {
      for (const key in config.shape) {
        if (data[key] === undefined) {
          throw new Error(`Missing key: ${key}`);
        }
      }
    }

    private static buildObject(item: Record<string, AttributeValue>): S {
      const obj: Partial<S> = {};

      for (const key in config.shape) {
        const settings = config.shape[key];
        const attr = item[settings.fieldName];

        if (attr == null) {
          if (settings.nullable) {
            obj[key] = null as S[typeof key];
          } else {
            throw new Error(`Missing key: ${key}`);
          }
        } else {
          switch (settings.type) {
            case "string":
              obj[key] = undefinedThrow(attr.S) as S[typeof key];
              break;
            case "boolean":
              obj[key] = undefinedThrow(attr.BOOL) as S[typeof key];
              break;
          }
        }
      }

      return obj as S;
    }

    constructor(data: Partial<S>) {
      this.data = data;

      return new Proxy(this, {
        get(target, prop, receiver) {
          // Proxy getter to read from this.data
          if (prop in config.shape) {
            return target.data[prop as keyof S];
          }

          return Reflect.get(target, prop, receiver);
        },
        set(target, prop, value, receiver) {
          // Proxy setter to write to this.data
          if (prop in config.shape) {
            target.data[prop as keyof S] = value;
            return true;
          }

          return Reflect.set(target, prop, value, receiver);
        },
      });
    }

    private data: Partial<S> = {};
    private isNew: boolean = true;

    /**
     * Convert underlying data to plain object. Will throw if any fields are
     * undefined.
     */
    toObject(): S {
      const obj: Partial<S> = {};
      for (const key in config.shape) {
        const val = undefinedThrow(this.data[key], `Missing key: ${key}`);
        obj[key] = val;
      }
      return obj as S;
    }

    async save() {
      if (this.isNew) {
        this.data.id = this.data.id ?? asUUID(uuidv4());

        const item = this.buildItem();

        await dynamoDbClient.send(
          new PutItemCommand({
            TableName: config.table,
            Item: item,
          }),
        );

        this.isNew = false;
      } else {
        OrmClass.validateFields(this.data);

        const item = this.buildItem();

        const {
          updateExpression,
          expressionAttributeNames,
          expressionAttributeValues,
        } = buildUpdateExpressionFieldsFromItem(item);

        await dynamoDbClient.send(
          new UpdateItemCommand({
            TableName: config.table,
            Key: {
              Id: { S: this.data.id },
            },
            UpdateExpression: updateExpression,
            ExpressionAttributeNames: expressionAttributeNames,
            ExpressionAttributeValues: expressionAttributeValues,
            ReturnValues: "NONE",
          }),
        );
      }
    }

    private buildItem(): Record<string, AttributeValue> {
      const obj = this.toObject();
      const item: Record<string, AttributeValue> = {};

      for (const key in config.shape) {
        const val = obj[key];
        const settings = config.shape[key];

        if (val == null) {
          continue;
        }

        switch (settings.type) {
          case "string":
            item[settings.fieldName] = { S: val as string };
            break;
          case "boolean":
            item[settings.fieldName] = { BOOL: val as boolean };
            break;
        }
      }

      return item;
    }
  }

  return {
    findById: OrmClass.findById,
    createOrmInstance(data: Partial<S>) {
      return new OrmClass(data) as OrmInstance;
    },
  };
}
