import SchemaBuilder from "@pothos/core";
import { Express } from "express";
import { createYoga } from "graphql-yoga";
import { attachUser, RequestWithUser } from "./middleware/user.js";

type Context = {
  req: RequestWithUser;
};

const builder = new SchemaBuilder<{ Context: Context }>({});

builder.queryType({
  fields(t) {
    return {
      hello: t.string({
        resolve(parent, args, context) {
          if (context.req.user?.name) {
            return `Hello ${context.req.user.name}!`;
          }

          return `Hello World!`;
        },
      }),
      isLoggedIn: t.boolean({
        description:
          "Check if there is a user and the user is not a placeholder user",
        resolve(parent, args, context) {
          // TODO: Check if user is a placeholder user
          return context.req.user != null;
        },
      }),
      isPlaceholderUserTokenInvalid: t.boolean({
        description: "Check if the placeholder user token is invalid",
        resolve(parent, args, context) {
          // TODO: Check if user is a placeholder user
          return true;
        },
      }),
    };
  },
});

const yoga = createYoga({
  schema: builder.toSchema(),
});

export default function setupGraphql(app: Express) {
  app.use(yoga.graphqlEndpoint, attachUser, yoga);
}
