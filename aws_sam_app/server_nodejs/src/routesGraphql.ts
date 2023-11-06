import { Express } from "express";
import { createYoga, createSchema } from "graphql-yoga";
import { RequestWithUser, attachUser } from "./middleware/user.js";

type Context = {
  req: RequestWithUser;
};

const yoga = createYoga({
  schema: createSchema<Context>({
    typeDefs: /* GraphQL */ `
      type Query {
        hello: String
      }
    `,
    resolvers: {
      Query: {
        hello: (_, _args, context) => {
          if (context.req.user?.name) {
            return `Hello ${context.req.user.name} from Yoga!`;
          }

          return `Hello from Yoga!`;
        },
      },
    },
  }),
});

export default function setupGraphql(app: Express) {
  app.use(yoga.graphqlEndpoint, attachUser, yoga);
}
