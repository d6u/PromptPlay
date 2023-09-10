import { cacheExchange } from "@urql/exchange-graphcache";
import { Client, fetchExchange } from "urql";
import { API_SERVER_BASE_URL } from "../constants";
import { useLocalStorageStore } from "./appState";

type Headers = {
  placeholderUserToken?: string;
};

export const client = new Client({
  url: `${API_SERVER_BASE_URL}/graphql`,
  exchanges: [
    cacheExchange({
      optimistic: {
        updateSpace(args) {
          return {
            __typename: "Space",
            id: args.id,
            content: args.content,
          };
        },
      },
    }),
    fetchExchange,
  ],
  fetchOptions: () => {
    const placeholderUserToken =
      useLocalStorageStore.getState().placeholderUserToken;

    const headers: Headers = {};

    if (placeholderUserToken) {
      headers.placeholderUserToken = placeholderUserToken;
    }

    return {
      credentials: "include",
      headers,
    };
  },
});
