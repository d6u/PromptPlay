import { gql } from "../__generated__";

export const SPACE_QUERY = gql(`
  query SpaceQuery($spaceId: UUID!) {
    result: space(id: $spaceId) {
      isReadOnly
      space {
        id
        name
        content
      }
    }
  }
`);

export const UPDATE_SPACE_MUTATION = gql(`
  mutation UpdateSpaceMutation($spaceId: ID!, $content: String!) {
    updateSpace(id: $spaceId, content: $content) {
      id
      name
      content
    }
  }
`);

export const DELETE_SPACE_MUTATION = gql(`
  mutation DeleteSpaceMutation($spaceId: ID!) {
    result: deleteSpace(id: $spaceId)
  }
`);
