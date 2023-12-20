import { V3FlowContent } from 'flow-models/v3-flow-content-types';
import { Observable } from 'rxjs';
import { OperationResult } from 'urql';
import { graphql } from '../../gql';
import { SpaceFlowQueryQuery } from '../../gql/graphql';
import { client } from '../../state/urql';
import { toRxObservableSingle } from '../../utils/graphql-utils';

export async function updateSpaceContentV3(
  spaceId: string,
  contentV3: V3FlowContent,
) {
  console.groupCollapsed('updateSpaceContentV3');
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
  console.groupEnd();
}

export function fetchFlowContent(
  spaceId: string,
): Observable<OperationResult<SpaceFlowQueryQuery>> {
  return toRxObservableSingle(
    client.query(
      graphql(`
        query SpaceFlowQuery($spaceId: UUID!) {
          result: space(id: $spaceId) {
            space {
              id
              name
              contentVersion
              contentV3
            }
          }
        }
      `),
      { spaceId },
      { requestPolicy: 'network-only' },
    ),
  );
}
