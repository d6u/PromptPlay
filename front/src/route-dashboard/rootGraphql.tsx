import { graphql } from 'gencode-gql';

export const ROOT_ROUTE_QUERY = graphql(`
  query RootRouteQuery {
    user {
      id
      ...Dashboard
    }
  }
`);
