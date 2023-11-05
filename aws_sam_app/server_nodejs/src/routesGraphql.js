import { createYoga, createSchema } from "graphql-yoga";

const yoga = createYoga({
  schema: createSchema({
    typeDefs: /* GraphQL */ `
      type Query {
        hello: String
      }
    `,
    resolvers: {
      Query: {
        hello: () => "Hello from Yoga!",
      },
    },
  }),
});

export default function setupGraphql(app) {
  app.use(yoga.graphqlEndpoint, yoga);
}
