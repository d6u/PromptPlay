import { graphql } from '../gql';

export const SPACE_QUERY = graphql(`
  query SpaceQuery($spaceId: UUID!) {
    result: space(id: $spaceId) {
      isReadOnly
      space {
        id
        name
        contentVersion
        content
      }
    }
  }
`);

export const UPDATE_SPACE_CONTENT_MUTATION = graphql(`
  mutation UpdateSpaceContentMutation($spaceId: ID!, $content: String!) {
    updateSpace(id: $spaceId, content: $content) {
      id
      name
      content
    }
  }
`);

export const UPDATE_SPACE_NAME_MUTATION = graphql(`
  mutation UpdateSpaceNameMutation($spaceId: ID!, $name: String!) {
    updateSpace(id: $spaceId, name: $name) {
      id
      name
      content
    }
  }
`);

export const DELETE_SPACE_MUTATION = graphql(`
  mutation DeleteSpaceMutation($spaceId: ID!) {
    result: deleteSpace(id: $spaceId)
  }
`);
