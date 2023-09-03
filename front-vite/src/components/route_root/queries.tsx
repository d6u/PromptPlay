import { gql } from "../../__generated__";

export const ROOT_ROUTE_QUERY = gql(`
  query RootRouteQuery {
    user {
      id
      ...Dashboard
    }
  }
`);
