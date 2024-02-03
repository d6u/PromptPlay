import posthog from 'posthog-js';
import { LoaderFunction, redirect } from 'react-router-dom';

import { graphql } from 'gencode-gql';
import { ContentVersion } from 'gencode-gql/graphql';
import { pathToCurrentContent } from 'generic-util/route-utils';
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
            isReadOnly
            space {
              id
              contentVersion
            }
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

  const contentVersion = queryResult.data.space!.space.contentVersion;

  if (
    contentVersion !== ContentVersion.V2 &&
    contentVersion !== ContentVersion.V3
  ) {
    return redirect(pathToCurrentContent(spaceId, contentVersion));
  }

  posthog.capture('Open Flow', { flowId: spaceId });

  return {
    isCurrentUserOwner: !queryResult.data.space!.isReadOnly,
  };
};

export default flowRouteLoader;
