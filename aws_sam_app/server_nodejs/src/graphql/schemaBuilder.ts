import SchemaBuilder from "@pothos/core";
import addMutationType from "./addMutationType.js";
import addQueryType from "./addQueryType.js";
import { Types } from "./graphql-types.js";

const builder = new SchemaBuilder<Types>({});

addQueryType(builder);
addMutationType(builder);

export default builder;
