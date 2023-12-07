import {
  AttributeValue,
  DeleteItemCommand,
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

interface WithId {
  id: UUID;
}

type Config<S> = {
  table: string;
  shape: Record<keyof S, FieldSettings>;
};

type FieldSettings = {
  type: "string" | "number" | "boolean";
  nullable: boolean;
  fieldName: string;
  toDbValue?: (val: unknown) => unknown;
  fromDbValue?: (val: unknown) => unknown;
};

type OrmShape<S> = {
  [P in keyof S]: S[P];
};

type OrmShapeWithDates<S> = OrmShape<S> & {
  updatedAt: Date;
  createdAt: Date;
};

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

      const obj = OrmClass.buildObjectFromItem(response.Item);

      const dbInstance = new OrmClass(obj);
      dbInstance.isNew = false;

      return dbInstance as OrmInstance;
    }

    static buildOrmInstanceFromItem(
      item: Record<string, AttributeValue>,
    ): OrmInstance {
      const obj = OrmClass.buildObjectFromItem(item);
      const dbInstance = new OrmClass(obj);
      dbInstance.isNew = false;
      return dbInstance as OrmInstance;
    }

    static async deleteById(id: UUID): Promise<boolean> {
      await dynamoDbClient.send(
        new DeleteItemCommand({
          TableName: config.table,
          Key: {
            Id: { S: id },
          },
        }),
      );

      return true;
    }

    private static validateFields(data: Partial<S>): asserts data is S {
      for (const key in config.shape) {
        if (data[key] === undefined) {
          throw new Error(`Missing key: ${key}`);
        }
      }
    }

    private static buildObjectFromItem(
      item: Record<string, AttributeValue>,
    ): S {
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
          let val: unknown;
          switch (settings.type) {
            case "string":
              val = undefinedThrow(attr.S);
              break;
            case "number":
              val = Number(undefinedThrow(attr.N));
              break;
            case "boolean":
              val = undefinedThrow(attr.BOOL);
              break;
          }

          if (settings.fromDbValue) {
            obj[key] = settings.fromDbValue(val) as S[typeof key];
          } else {
            obj[key] = val as S[typeof key];
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

        // TODO: Generalize these into a config
        if ("createdAt" in config.shape) {
          (this.data as OrmShapeWithDates<S>).createdAt = new Date();
        }
        if ("updatedAt" in config.shape) {
          (this.data as OrmShapeWithDates<S>).updatedAt = new Date();
        }

        OrmClass.validateFields(this.data);

        const item = this.buildItem();

        await dynamoDbClient.send(
          new PutItemCommand({
            TableName: config.table,
            Item: item,
          }),
        );

        this.isNew = false;
      } else {
        // TODO: Generalize these into a config
        if ("updatedAt" in config.shape) {
          (this.data as OrmShapeWithDates<S>).updatedAt = new Date();
        }

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

        let dbValue: unknown;

        if (settings.toDbValue) {
          dbValue = settings.toDbValue(val);
        } else {
          dbValue = val;
        }

        switch (settings.type) {
          case "string":
            item[settings.fieldName] = { S: dbValue as string };
            break;
          case "number":
            item[settings.fieldName] = { N: String(dbValue) };
            break;
          case "boolean":
            item[settings.fieldName] = { BOOL: dbValue as boolean };
            break;
        }
      }

      return item;
    }
  }

  return {
    findById: OrmClass.findById,
    deleteById: OrmClass.deleteById,
    buildOrmInstanceFromItem: OrmClass.buildOrmInstanceFromItem,
    createOrmInstance(data: Partial<S>) {
      return new OrmClass(data) as OrmInstance;
    },
  };
}
