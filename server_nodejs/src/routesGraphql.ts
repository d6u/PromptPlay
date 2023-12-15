import { Express } from "express";
import { createYoga } from "graphql-yoga";
import schemaBuilder from "./graphql/schemaBuilder.js";
import { attachUser } from "./middleware/user.js";

const yoga = createYoga({
  schema: schemaBuilder.toSchema(),
});

export default function setupGraphql(app: Express) {
  app.use(yoga.graphqlEndpoint, attachUser, yoga);
}
