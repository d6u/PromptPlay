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
      updates: {
        Mutation: {
          // createCsvEvaluationPreset(result, args, cache, info) {
          //   cache.invalidate(
          //     { __typename: "Space", id: args.spaceId as string },
          //     "csvEvaluationPresets"
          //   );
          // },
        },
      },
      optimistic: {
        updateSpace(args) {
          return {
            __typename: "Space",
            id: args.id,
            content: args.content,
          };
        },
      },
      keys: {
        QuerySpaceResult: () => null,
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
