import possibleTypes from "../__generated__/possibleTypes.json";
import { API_SERVER_BASE_URL, IS_LOGIN_ENABLED } from "../constants";
import {
  ApolloClient,
  ApolloClientOptions,
  InMemoryCache,
  NormalizedCacheObject,
} from "@apollo/client";

type CreateApolloClientOptions = {
  // Can be ""
  placeholderUserToken: string;
};

export type ApolloClientType = ApolloClient<NormalizedCacheObject>;

export function createApolloClient({
  placeholderUserToken,
}: CreateApolloClientOptions): ApolloClientType {
  const options: ApolloClientOptions<NormalizedCacheObject> = {
    credentials: IS_LOGIN_ENABLED ? "include" : "omit",
    uri: `${API_SERVER_BASE_URL}/graphql`,
    cache: new InMemoryCache({
      possibleTypes: possibleTypes.possibleTypes,
    }),
  };

  if (placeholderUserToken) {
    options.headers = { placeholderUserToken };
  }

  return new ApolloClient(options);
}
