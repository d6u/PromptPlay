import { CanvasDataV4 } from 'flow-models';

import { graphql } from 'gencode-gql';
import { client } from 'graphql-util/client';

export async function updateSpaceContentV4(
  spaceId: string,
  canvasData: CanvasDataV4,
) {
  await client.mutation(
    graphql(`
      mutation UpdateSpaceContentV4Mutation(
        $spaceId: ID!
        $canvasData: String!
      ) {
        updateSpace(
          id: $spaceId
          contentVersion: v4
          canvasDataV4: $canvasData
        ) {
          id
          canvasData
        }
      }
    `),
    {
      spaceId,
      canvasData: JSON.stringify(canvasData),
    },
  );
}
