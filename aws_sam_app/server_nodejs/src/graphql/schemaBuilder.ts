import SchemaBuilder from "@pothos/core";
import { UUIDResolver } from "graphql-scalars";
import addMutationType from "./addMutationType.js";
import addQueryType from "./addQueryType.js";
import { Types } from "./graphql-types.js";

const builder = new SchemaBuilder<Types>({});

builder.scalarType("DateTime", {
  serialize(n) {
    const str = n.toISOString();
    // TODO: This is a temporary hack to align with Python server's DateTime format.
    return str.substring(0, str.length - 1);
  },
  parseValue(n: unknown) {
    if (n instanceof Date) {
      return n;
    }
    throw new Error("Invalid date");
  },
});

builder.addScalarType("UUID", UUIDResolver, {});

addQueryType(builder);
addMutationType(builder);

export default builder;
