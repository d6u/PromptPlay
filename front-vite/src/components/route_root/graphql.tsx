import { gql } from "../../__generated__";

export const HEADER_QUERY = gql(`
  query HeaderQuery {
    isLoggedIn
    isPlaceholderUserTokenInvalid
    user {
      email
      profilePictureUrl
    }
  }
`);

export const MERGE_PLACEHOLDER_USER_WITH_LOGGED_IN_USER_MUTATION = gql(`
  mutation MergePlaceholderUserWithLoggedInUserMutation(
    $placeholderUserToken: String!
  ) {
    result: mergePlaceholderUserWithLoggedInUser(
      placeholderUserToken: $placeholderUserToken
    )
  }
`);
