import { gql } from "../../__generated__";

export const WORKSPACE_ROUTE_QUERY = gql(`
  query WorkspaceRouteQuery(
    $workspaceId: UUID!
  ) {
    user {
      id
    }
    ...SubHeaderFragment
    ...WorkspaceQuery
  }
`);
