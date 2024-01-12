import posthog from 'posthog-js';
import { LoaderFunction } from 'react-router-dom';
import { graphql } from '../../gql';
import { client } from '../../state/urql';

const routeLoaderRoot: LoaderFunction = async (args) => {
  const queryResult = await client
    .query(
      graphql(`
        query RootRouteLoaderQuery {
          user {
            isPlaceholderUser
            id
            email
          }
        }
      `),
      {},
      { requestPolicy: 'network-only' },
    )
    .toPromise();

  if (queryResult.error || !queryResult.data) {
    // TODO: Report error or missing data
    return null;
  }

  const { user } = queryResult.data;

  // ANCHOR: Analytics

  if (user && !user.isPlaceholderUser) {
    // TODO: Report when user ID is null
    if (user.id) {
      // NOTE: We can assume user ID never changes unless page reloads,
      // because to log out or log in we redirect the page to another url.
      // NOTE: We also call reset during logout.
      posthog.identify(user.id, { email: user.email });
    }
  }

  return null;
};

export default routeLoaderRoot;
