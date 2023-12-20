import { graphql } from '../../gql';

export const ROOT_ROUTE_QUERY = graphql(`
  query RootRouteQuery {
    user {
      id
      ...Dashboard
    }
  }
`);
