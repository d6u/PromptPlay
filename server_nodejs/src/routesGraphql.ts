import { Express } from 'express';
import { createYoga } from 'graphql-yoga';
import attachUser from './middleware/attachUser';

// Order is important for below imports
import schemaBuilder from './graphql/schemaBuilder';

import './graphql/addObjectTypes';

import './graphql/addQueryType';

import './graphql/addMutationType';

const yoga = createYoga({
  schema: schemaBuilder.toSchema(),
});

export default function setupGraphql(app: Express) {
  app.use(
    yoga.graphqlEndpoint,
    attachUser,
    // NOTE: Uncomment to simulate network latency.
    // (req, res, next) => {
    //   setTimeout(
    //     () => {
    //       next();
    //     },
    //     1000 + Math.random() * 100,
    //   );
    // },
    yoga,
  );
}
