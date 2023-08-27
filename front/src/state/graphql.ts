import {
  ApolloClient,
  ApolloClientOptions,
  InMemoryCache,
  NormalizedCacheObject,
} from "@apollo/client";
import possibleTypes from "../__generated__/possibleTypes.json";
import { API_SERVER_BASE_URL, IS_LOGIN_ENABLED } from "../constants";

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

type BlockSet = {
  __typename?: "BlockSet" | undefined;
  id: any;
  position: number;
};

export function swapBlockSets(
  blockSets: Readonly<BlockSet>[],
  movingBlockSetId: string,
  slotBlockSetId: string
): BlockSet[] | null {
  if (movingBlockSetId === slotBlockSetId) {
    return null;
  }

  const movingBlockSetIndex = blockSets.findIndex(
    ({ id }) => id === movingBlockSetId
  );

  if (movingBlockSetIndex === -1) {
    console.error("cannot find moving block set");
    return null;
  }

  const slotBlockSetIndex = blockSets.findIndex(
    ({ id }) => id === slotBlockSetId
  );

  if (slotBlockSetIndex === -1) {
    console.error("cannot find slot block set");
    return null;
  }

  const movingBlockSet = { ...blockSets[movingBlockSetIndex] };
  const newBlockSets: BlockSet[] = [];
  let pos = 0;

  for (const blockSet of blockSets) {
    if (blockSet.id === movingBlockSetId) {
      continue;
    }

    if (
      blockSet.id === slotBlockSetId &&
      movingBlockSetIndex > slotBlockSetIndex
    ) {
      movingBlockSet.position = pos;
      pos++;
      newBlockSets.push(movingBlockSet);
    }

    const blockSetCopy = { ...blockSet };
    blockSetCopy.position = pos;
    pos++;
    newBlockSets.push(blockSetCopy);

    if (
      blockSet.id === slotBlockSetId &&
      movingBlockSetIndex < slotBlockSetIndex
    ) {
      movingBlockSet.position = pos;
      pos++;
      newBlockSets.push(movingBlockSet);
    }
  }

  return newBlockSets;
}
