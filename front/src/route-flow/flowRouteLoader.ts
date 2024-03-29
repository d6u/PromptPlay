import posthog from 'posthog-js';
import { LoaderFunction } from 'react-router-dom';

import { graphql } from 'gencode-gql';
import { client } from 'graphql-util/client';

export type FlowLoaderData = {
  isCurrentUserOwner: boolean;
};

const flowRouteLoader: LoaderFunction = async ({ params }) => {
  const spaceId = params.spaceId!;

  const queryResult = await client
    .query(
      graphql(`
        query SpaceContentVersionQuery($spaceId: UUID!) {
          space(id: $spaceId) {
            id
            isReadOnly
            canvasDataSchemaVersion
          }
        }
      `),
      { spaceId },
      { requestPolicy: 'network-only' },
    )
    .toPromise();

  if (queryResult.error || !queryResult.data) {
    // TODO: Report error or missing data
    return null;
  }

  posthog.capture('Open Flow', { flowId: spaceId });

  return {
    isCurrentUserOwner: !queryResult.data.space!.isReadOnly,
  };
};

export default flowRouteLoader;
