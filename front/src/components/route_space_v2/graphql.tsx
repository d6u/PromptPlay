import { gql } from "../../__generated__";

export const SPACE_V2_QUERY = gql(`
  query SpaceV2Query($spaceId: UUID!) {
    spaceV2(id: $spaceId) {
      id
      name
      content
    }
  }
`);

export const UPDATE_SPACE_V2_MUTATION = gql(`
  mutation UpdateSpaceV2Mutation($spaceId: UUID!, $content: String!) {
    updateSpaceV2(id: $spaceId, content: $content) {
      id
      name
      content
    }
  }
`);
