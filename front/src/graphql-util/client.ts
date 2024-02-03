import { cacheExchange } from '@urql/exchange-graphcache';
import { Client, fetchExchange } from 'urql';

import { API_SERVER_BASE_URL } from 'global-config/global-config';

export const client = new Client({
  url: `${API_SERVER_BASE_URL}/graphql`,
  exchanges: [
    cacheExchange({
      optimistic: {
        updateSpace(args) {
          return {
            __typename: 'Space',
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
    return {
      credentials: 'include',
    };
  },
});
