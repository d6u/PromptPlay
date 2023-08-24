import { gql } from "../../__generated__";

export const UPDATE_SPACE_V2_MUTATION = gql(`
  mutation UpdateSpaceV2Mutation($spaceId: UUID!, $content: String!) {
    updateSpaceV2(id: $spaceId, content: $content) {
      id
      name
      content
    }
  }
`);
