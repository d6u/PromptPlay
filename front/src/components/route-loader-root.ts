import posthog from 'posthog-js';
import { LoaderFunction } from 'react-router-dom';
import { graphql } from '../gql';
import { useLocalStorageStore } from '../state/appState';
import { client } from '../state/urql';

const routeLoaderRoot: LoaderFunction = async (args) => {
  const url = new URL(args.request.url);
  const isNewUser = url.searchParams.get('new_user') === 'true';

  const { data } = await client.query(
    graphql(`
      query RootHeaderLoader {
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

  if (data == null) {
    throw new Error('No data');
  }

  const { isLoggedIn, isPlaceholderUserTokenInvalid } = data;

  // ANCHOR: Analytics

  if (isLoggedIn) {
    if (data.user?.id == null) {
      throw new Error('No user id');
    }
    // NOTE: We can assume user ID never changes,
    // because to log out, we reload the page.
    posthog.identify(data.user.id, { email: data.user?.email });
  }

  // ANCHOR: Placeholder user clear up

  const { placeholderUserToken, setPlaceholderUserToken } =
    useLocalStorageStore.getState();

  if (placeholderUserToken) {
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
