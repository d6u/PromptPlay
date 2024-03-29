import { Client, fetchExchange } from 'urql';

import { API_SERVER_BASE_URL } from 'global-config/global-config';

export const client = new Client({
  url: `${API_SERVER_BASE_URL}/graphql`,
  exchanges: [fetchExchange],
  fetchOptions: () => {
    return {
      credentials: 'include',
    };
  },
});
