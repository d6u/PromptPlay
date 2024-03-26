import { CanvasDataV4 } from 'flow-models';

import { graphql } from 'gencode-gql';
import { client } from 'graphql-util/client';

export async function updateSpaceContentV4(
  spaceId: string,
  canvasData: CanvasDataV4,
) {
  await client.mutation(
    graphql(`
      mutation UpdateSpaceContentV3Mutation(
        $spaceId: ID!
        $canvasData: String!
      ) {
        updateSpace(
          id: $spaceId
          contentVersion: v3
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
