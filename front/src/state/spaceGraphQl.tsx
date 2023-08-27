import { gql } from "../__generated__";

export const SPACE_QUERY = gql(`
  query SpaceQuery($spaceId: UUID!) {
    space(id: $spaceId) {
      id
      name
      content
    }
  }
`);

export const UPDATE_SPACE_MUTATION = gql(`
  mutation UpdateSpaceMutation($spaceId: UUID!, $content: String!) {
    updateSpace(id: $spaceId, content: $content) {
      id
      name
      content
    }
  }
`);
