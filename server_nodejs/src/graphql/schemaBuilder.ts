import SchemaBuilder from "@pothos/core";
import { UUIDResolver } from "graphql-scalars";
import addMutationType from "./addMutationType.js";
import addObjectTypes from "./addObjectTypes.js";
import addQueryType from "./addQueryType.js";
import { SpaceContentVersion, Types } from "./graphql-types.js";

const builder = new SchemaBuilder<Types>({});

builder.addScalarType("UUID", UUIDResolver, {});

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

builder.enumType(SpaceContentVersion, {
  name: "ContentVersion",
});

addObjectTypes(builder);
addQueryType(builder);
addMutationType(builder);

export default builder;
