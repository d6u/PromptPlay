import { graphql } from "../../gql";

export const HEADER_QUERY = graphql(`
  query HeaderQuery {
    isLoggedIn
    isPlaceholderUserTokenInvalid
    user {
      id
      email
      profilePictureUrl
    }
  }
`);

export const MERGE_PLACEHOLDER_USER_WITH_LOGGED_IN_USER_MUTATION = graphql(`
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
`);

export const ROOT_ROUTE_QUERY = graphql(`
  query RootRouteQuery {
    user {
      id
      ...Dashboard
    }
  }
`);
export const CREATE_PLACEHOLDER_USER_AND_EXAMPLE_SPACE_MUTATION = graphql(`
  mutation CreatePlaceholderUserAndExampleSpaceMutation {
    result: createPlaceholderUserAndExampleSpace {
      placeholderClientToken
      space {
        id
      }
    }
  }
`);
