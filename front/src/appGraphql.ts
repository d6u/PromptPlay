import { graphql } from './gql';

export const SpaceContentVersionQuery = graphql(`
  query SpaceContentVersionQuery($spaceId: UUID!) {
    space(id: $spaceId) {
      isReadOnly
      space {
        id
        contentVersion
      }
    }
  }
`);
