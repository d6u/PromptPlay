import posthog from 'posthog-js';
import { LoaderFunction } from 'react-router-dom';
import { graphql } from '../../gql';
import { useLocalStorageStore } from '../../state/appState';
import { client } from '../../state/urql';

const routeLoaderRoot: LoaderFunction = async (args) => {
  const queryResult = await client.query(
    graphql(`
      query RootRouteLoaderQuery {
        isLoggedIn
        isPlaceholderUserTokenInvalid
        user {
          id
          email
        }
      }
    `),
    {},
    { requestPolicy: 'network-only' },
  );

  if (queryResult.data == null) {
    // TODO: Report error
    return null;
  }

  const { isLoggedIn, isPlaceholderUserTokenInvalid } = queryResult.data;

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

  // ANCHOR: Merge placeholder user when conditions are met

  const { placeholderUserToken, setPlaceholderUserToken } =
    useLocalStorageStore.getState();

  if (placeholderUserToken) {
    const url = new URL(args.request.url);
    const isNewUser = url.searchParams.get('new_user') === 'true';

    if (isPlaceholderUserTokenInvalid) {
      setPlaceholderUserToken(null);
    } else if (isLoggedIn && isNewUser) {
      await client
        .mutation(
          graphql(`
            mutation MergePlaceholderUserWithLoggedInUserMutation(
              $placeholderUserToken: String!
            ) {
              result: mergePlaceholderUserWithLoggedInUser(
                placeholderUserToken: $placeholderUserToken
              ) {
                id
                spaces {
                  id
                }
              }
            }
          `),
          { placeholderUserToken },
        )
        .toPromise();

      setPlaceholderUserToken(null);
    }
  }

  return null;
};

export default routeLoaderRoot;
