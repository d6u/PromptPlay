import { gql } from "../__generated__";

export const SPACE_QUERY = gql(`
  query SpaceQuery($spaceId: UUID!) {
    result: space(id: $spaceId) {
      isReadOnly
      space {
        ...SpaceSubHeaderFragment
        id
        name
        content
      }
    }
  }
`);

export const UPDATE_SPACE_CONTENT_MUTATION = gql(`
  mutation UpdateSpaceContentMutation($spaceId: ID!, $content: String!) {
    updateSpace(id: $spaceId, content: $content) {
      id
      name
      content
    }
  }
`);

export const UPDATE_SPACE_NAME_MUTATION = gql(`
  mutation UpdateSpaceNameMutation($spaceId: ID!, $name: String!) {
    updateSpace(id: $spaceId, name: $name) {
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
