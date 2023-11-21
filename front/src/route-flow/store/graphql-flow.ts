import { graphql } from "../../gql";

export const SPACE_FLOW_QUERY = graphql(`
  query SpaceFlowQuery($spaceId: UUID!) {
    result: space(id: $spaceId) {
      space {
        id
        name
        contentVersion
        flowContent
      }
    }
  }
`);

export const UPDATE_SPACE_FLOW_CONTENT_MUTATION = graphql(`
  mutation UpdateSpaceFlowContentMutation(
    $spaceId: ID!
    $flowContent: String!
  ) {
    updateSpace(id: $spaceId, flowContent: $flowContent) {
      id
      name
      flowContent
    }
  }
`);
