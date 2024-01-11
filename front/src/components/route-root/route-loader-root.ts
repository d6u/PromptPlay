import posthog from 'posthog-js';
import { LoaderFunction } from 'react-router-dom';
import { graphql } from '../../gql';
import { client } from '../../state/urql';

const routeLoaderRoot: LoaderFunction = async (args) => {
  const queryResult = await client
    .query(
      graphql(`
        query RootRouteLoaderQuery {
          isLoggedIn
          user {
            id
            email
          }
        }
      `),
      {},
      { requestPolicy: 'network-only' },
    )
    .toPromise();

  if (queryResult.data == null) {
    // TODO: Report error
    return null;
  }

  const { isLoggedIn } = queryResult.data;

  // ANCHOR: Analytics

  if (isLoggedIn) {
    // TODO: Report when user ID is null
    if (queryResult.data.user?.id != null) {
      // NOTE: We can assume user ID never changes, because to log out or log in
      // we have to redirect the page to another url.
      posthog.identify(queryResult.data.user.id, {
        email: queryResult.data.user.email,
      });
    }
  }

  return null;
};

export default routeLoaderRoot;
