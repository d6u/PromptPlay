import { redirect } from 'react-router-dom';
import { map } from 'rxjs';
import { SpaceContentVersionQuery } from '../../appGraphql';
import { ContentVersion } from '../../gql/graphql';
import { client } from '../../state/urql';
import { fromWonka } from '../../utils/graphql-utils';
import { createObservableLoader } from '../../utils/react-router-utils';
import { pathToCurrentContent } from '../../utils/route-utils';

export type FlowLoaderData = {
  isCurrentUserOwner: boolean;
};

const loader = createObservableLoader<FlowLoaderData>((params) => {
  const spaceId = params.spaceId!;

  return fromWonka(
    client.query(
      SpaceContentVersionQuery,
      { spaceId },
      { requestPolicy: 'network-only' },
    ),
  ).pipe(
    map((result) => {
      if (result.error) {
        throw result.error;
      }

      if (!result.data?.space) {
        throw new Error('Not found');
      }

      const contentVersion = result?.data?.space?.space.contentVersion;

      if (
        contentVersion !== ContentVersion.V2 &&
        contentVersion !== ContentVersion.V3
      ) {
        return redirect(pathToCurrentContent(spaceId, contentVersion));
      }

      return { isCurrentUserOwner: !result.data.space.isReadOnly };
    }),
  );
});

export default loader;
