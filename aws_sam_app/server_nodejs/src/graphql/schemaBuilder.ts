import SchemaBuilder from "@pothos/core";
import addQueryType from "./addQueryType.js";
import { Types } from "./graphql-types.js";

const builder = new SchemaBuilder<Types>({});

addQueryType(builder);

export default builder;
