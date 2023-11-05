import { createYoga, createSchema } from "graphql-yoga";
import { attachUser } from "./middleware/user.js";

const yoga = createYoga({
  schema: createSchema({
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

export default function setupGraphql(app) {
  app.use(yoga.graphqlEndpoint, attachUser, yoga);
}
