/* eslint-disable */
import * as types from './graphql';
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 */
const documents = {
    "\n  query HeaderSpaceNameQuery($spaceId: UUID!) {\n    result: space(id: $spaceId) {\n      isReadOnly\n      space {\n        name\n      }\n    }\n  }\n": types.HeaderSpaceNameQueryDocument,
    "\n  query SpaceFlowQuery($spaceId: UUID!) {\n    result: space(id: $spaceId) {\n      isReadOnly\n      space {\n        ...SpaceSubHeaderFragment\n        id\n        name\n        contentVersion\n        flowContent\n      }\n    }\n  }\n": types.SpaceFlowQueryDocument,
    "\n  mutation UpdateSpaceFlowContentMutation(\n    $spaceId: ID!\n    $flowContent: String!\n  ) {\n    updateSpace(id: $spaceId, flowContent: $flowContent) {\n      id\n      name\n      flowContent\n    }\n  }\n": types.UpdateSpaceFlowContentMutationDocument,
    "\n  fragment Dashboard on User {\n    spaces {\n      id\n      name\n      updatedAt\n      contentVersion\n    }\n  }\n": types.DashboardFragmentDoc,
    "\n  mutation CreateSpaceMutation {\n    result: createSpace {\n      id\n      name\n      updatedAt\n    }\n  }\n": types.CreateSpaceMutationDocument,
    "\n  query HeaderQuery {\n    isLoggedIn\n    isPlaceholderUserTokenInvalid\n    user {\n      id\n      email\n      profilePictureUrl\n    }\n  }\n": types.HeaderQueryDocument,
    "\n  mutation MergePlaceholderUserWithLoggedInUserMutation(\n    $placeholderUserToken: String!\n  ) {\n    result: mergePlaceholderUserWithLoggedInUser(\n      placeholderUserToken: $placeholderUserToken\n    ) {\n      id\n      spaces {\n        id\n      }\n    }\n  }\n": types.MergePlaceholderUserWithLoggedInUserMutationDocument,
    "\n  query RootRouteQuery {\n    user {\n      id\n      ...Dashboard\n    }\n  }\n": types.RootRouteQueryDocument,
    "\n  mutation CreatePlaceholderUserAndExampleSpaceMutation {\n    result: createPlaceholderUserAndExampleSpace {\n      placeholderClientToken\n      space {\n        id\n      }\n    }\n  }\n": types.CreatePlaceholderUserAndExampleSpaceMutationDocument,
    "\n  fragment SpaceSubHeaderFragment on Space {\n    name\n  }\n": types.SpaceSubHeaderFragmentFragmentDoc,
    "\n  query SpaceQuery($spaceId: UUID!) {\n    result: space(id: $spaceId) {\n      isReadOnly\n      space {\n        ...SpaceSubHeaderFragment\n        id\n        name\n        contentVersion\n        content\n      }\n    }\n  }\n": types.SpaceQueryDocument,
    "\n  mutation UpdateSpaceContentMutation($spaceId: ID!, $content: String!) {\n    updateSpace(id: $spaceId, content: $content) {\n      id\n      name\n      content\n    }\n  }\n": types.UpdateSpaceContentMutationDocument,
    "\n  mutation UpdateSpaceNameMutation($spaceId: ID!, $name: String!) {\n    updateSpace(id: $spaceId, name: $name) {\n      id\n      name\n      content\n    }\n  }\n": types.UpdateSpaceNameMutationDocument,
    "\n  mutation DeleteSpaceMutation($spaceId: ID!) {\n    result: deleteSpace(id: $spaceId)\n  }\n": types.DeleteSpaceMutationDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = graphql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function graphql(source: string): unknown;

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query HeaderSpaceNameQuery($spaceId: UUID!) {\n    result: space(id: $spaceId) {\n      isReadOnly\n      space {\n        name\n      }\n    }\n  }\n"): (typeof documents)["\n  query HeaderSpaceNameQuery($spaceId: UUID!) {\n    result: space(id: $spaceId) {\n      isReadOnly\n      space {\n        name\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query SpaceFlowQuery($spaceId: UUID!) {\n    result: space(id: $spaceId) {\n      isReadOnly\n      space {\n        ...SpaceSubHeaderFragment\n        id\n        name\n        contentVersion\n        flowContent\n      }\n    }\n  }\n"): (typeof documents)["\n  query SpaceFlowQuery($spaceId: UUID!) {\n    result: space(id: $spaceId) {\n      isReadOnly\n      space {\n        ...SpaceSubHeaderFragment\n        id\n        name\n        contentVersion\n        flowContent\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation UpdateSpaceFlowContentMutation(\n    $spaceId: ID!\n    $flowContent: String!\n  ) {\n    updateSpace(id: $spaceId, flowContent: $flowContent) {\n      id\n      name\n      flowContent\n    }\n  }\n"): (typeof documents)["\n  mutation UpdateSpaceFlowContentMutation(\n    $spaceId: ID!\n    $flowContent: String!\n  ) {\n    updateSpace(id: $spaceId, flowContent: $flowContent) {\n      id\n      name\n      flowContent\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment Dashboard on User {\n    spaces {\n      id\n      name\n      updatedAt\n      contentVersion\n    }\n  }\n"): (typeof documents)["\n  fragment Dashboard on User {\n    spaces {\n      id\n      name\n      updatedAt\n      contentVersion\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation CreateSpaceMutation {\n    result: createSpace {\n      id\n      name\n      updatedAt\n    }\n  }\n"): (typeof documents)["\n  mutation CreateSpaceMutation {\n    result: createSpace {\n      id\n      name\n      updatedAt\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query HeaderQuery {\n    isLoggedIn\n    isPlaceholderUserTokenInvalid\n    user {\n      id\n      email\n      profilePictureUrl\n    }\n  }\n"): (typeof documents)["\n  query HeaderQuery {\n    isLoggedIn\n    isPlaceholderUserTokenInvalid\n    user {\n      id\n      email\n      profilePictureUrl\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation MergePlaceholderUserWithLoggedInUserMutation(\n    $placeholderUserToken: String!\n  ) {\n    result: mergePlaceholderUserWithLoggedInUser(\n      placeholderUserToken: $placeholderUserToken\n    ) {\n      id\n      spaces {\n        id\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation MergePlaceholderUserWithLoggedInUserMutation(\n    $placeholderUserToken: String!\n  ) {\n    result: mergePlaceholderUserWithLoggedInUser(\n      placeholderUserToken: $placeholderUserToken\n    ) {\n      id\n      spaces {\n        id\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query RootRouteQuery {\n    user {\n      id\n      ...Dashboard\n    }\n  }\n"): (typeof documents)["\n  query RootRouteQuery {\n    user {\n      id\n      ...Dashboard\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation CreatePlaceholderUserAndExampleSpaceMutation {\n    result: createPlaceholderUserAndExampleSpace {\n      placeholderClientToken\n      space {\n        id\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation CreatePlaceholderUserAndExampleSpaceMutation {\n    result: createPlaceholderUserAndExampleSpace {\n      placeholderClientToken\n      space {\n        id\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment SpaceSubHeaderFragment on Space {\n    name\n  }\n"): (typeof documents)["\n  fragment SpaceSubHeaderFragment on Space {\n    name\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query SpaceQuery($spaceId: UUID!) {\n    result: space(id: $spaceId) {\n      isReadOnly\n      space {\n        ...SpaceSubHeaderFragment\n        id\n        name\n        contentVersion\n        content\n      }\n    }\n  }\n"): (typeof documents)["\n  query SpaceQuery($spaceId: UUID!) {\n    result: space(id: $spaceId) {\n      isReadOnly\n      space {\n        ...SpaceSubHeaderFragment\n        id\n        name\n        contentVersion\n        content\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation UpdateSpaceContentMutation($spaceId: ID!, $content: String!) {\n    updateSpace(id: $spaceId, content: $content) {\n      id\n      name\n      content\n    }\n  }\n"): (typeof documents)["\n  mutation UpdateSpaceContentMutation($spaceId: ID!, $content: String!) {\n    updateSpace(id: $spaceId, content: $content) {\n      id\n      name\n      content\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation UpdateSpaceNameMutation($spaceId: ID!, $name: String!) {\n    updateSpace(id: $spaceId, name: $name) {\n      id\n      name\n      content\n    }\n  }\n"): (typeof documents)["\n  mutation UpdateSpaceNameMutation($spaceId: ID!, $name: String!) {\n    updateSpace(id: $spaceId, name: $name) {\n      id\n      name\n      content\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation DeleteSpaceMutation($spaceId: ID!) {\n    result: deleteSpace(id: $spaceId)\n  }\n"): (typeof documents)["\n  mutation DeleteSpaceMutation($spaceId: ID!) {\n    result: deleteSpace(id: $spaceId)\n  }\n"];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;