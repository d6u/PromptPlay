import { CanvasDataV3 } from 'flow-models';

import { graphql } from 'gencode-gql';
import { client } from 'graphql-util/client';

export async function updateSpaceContentV3(
  spaceId: string,
  contentV3: CanvasDataV3,
) {
  await client.mutation(
    graphql(`
      mutation UpdateSpaceContentV3Mutation(
        $spaceId: ID!
        $contentV3: String!
      ) {
        updateSpace(id: $spaceId, contentVersion: v3, contentV3: $contentV3) {
          id
          contentV3
        }
      }
    `),
    {
      spaceId,
      contentV3: JSON.stringify(contentV3),
    },
  );
}
