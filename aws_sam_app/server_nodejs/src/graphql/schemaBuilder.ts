import SchemaBuilder from "@pothos/core";
import { DateTimeResolver } from "graphql-scalars";
import addMutationType from "./addMutationType.js";
import addQueryType from "./addQueryType.js";
import { Types } from "./graphql-types.js";

const builder = new SchemaBuilder<Types>({});

builder.addScalarType("Date", DateTimeResolver, {});

addQueryType(builder);
addMutationType(builder);

export default builder;