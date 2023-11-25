import { graphql } from "../../gql";

export const SPACE_FLOW_QUERY = graphql(`
  query SpaceFlowQuery($spaceId: UUID!) {
    result: space(id: $spaceId) {
      space {
        id
        name
        contentVersion
        flowContent
        contentV3
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

export const UPDATE_SPACE_CONTENT_V3_MUTATION = graphql(`
  mutation UpdateSpaceContentV3Mutation($spaceId: ID!, $contentV3: String!) {
    updateSpace(id: $spaceId, contentV3: $contentV3) {
      id
      contentV3
    }
  }
`);
