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
    "\n  query SpaceContentVersionQuery($spaceId: UUID!) {\n    space(id: $spaceId) {\n      isReadOnly\n      space {\n        id\n        contentVersion\n      }\n    }\n  }\n": types.SpaceContentVersionQueryDocument,
    "\n  query HeaderSpaceNameQuery($spaceId: UUID!) {\n    result: space(id: $spaceId) {\n      isReadOnly\n      space {\n        id\n        name\n      }\n    }\n  }\n": types.HeaderSpaceNameQueryDocument,
    "\n  query EvaluationModeCSVContentQuery($spaceId: UUID!, $presetId: ID!) {\n    result: space(id: $spaceId) {\n      space {\n        id\n        csvEvaluationPreset(id: $presetId) {\n          id\n          csvContent\n          configContent\n        }\n      }\n    }\n  }\n": types.EvaluationModeCsvContentQueryDocument,
    "\n  query PresetSelectorQuery($spaceId: UUID!) {\n    result: space(id: $spaceId) {\n      space {\n        id\n        csvEvaluationPresets {\n          id\n          name\n        }\n      }\n    }\n  }\n": types.PresetSelectorQueryDocument,
    "\n  query SpaceFlowQuery($spaceId: UUID!) {\n    result: space(id: $spaceId) {\n      space {\n        id\n        name\n        contentVersion\n        flowContent\n        contentV3\n      }\n    }\n  }\n": types.SpaceFlowQueryDocument,
    "\n  mutation UpdateSpaceContentV3Mutation($spaceId: ID!, $contentV3: String!) {\n    updateSpace(id: $spaceId, contentVersion: v3, contentV3: $contentV3) {\n      id\n      contentV3\n    }\n  }\n": types.UpdateSpaceContentV3MutationDocument,
    "\n  mutation CreateCsvEvaluationPresetMutation(\n    $spaceId: ID!\n    $name: String!\n    $csvContent: String\n  ) {\n    result: createCsvEvaluationPreset(\n      spaceId: $spaceId\n      name: $name\n      csvContent: $csvContent\n    ) {\n      space {\n        id\n        csvEvaluationPresets {\n          id\n        }\n      }\n      csvEvaluationPreset {\n        id\n        name\n        csvContent\n        configContent\n      }\n    }\n  }\n": types.CreateCsvEvaluationPresetMutationDocument,
    "\n  mutation UpdateCsvEvaluationPresetMutation(\n    $presetId: ID!\n    $name: String\n    $csvContent: String\n  ) {\n    updateCsvEvaluationPreset(\n      presetId: $presetId\n      name: $name\n      csvContent: $csvContent\n    ) {\n      id\n      name\n      csvContent\n      configContent\n    }\n  }\n": types.UpdateCsvEvaluationPresetMutationDocument,
    "\n  mutation DeleteCsvEvaluationPresetMutation($presetId: ID!) {\n    space: deleteCsvEvaluationPreset(id: $presetId) {\n      id\n      csvEvaluationPresets {\n        id\n      }\n    }\n  }\n": types.DeleteCsvEvaluationPresetMutationDocument,
    "\n  fragment Dashboard on User {\n    spaces {\n      id\n      name\n      updatedAt\n      contentVersion\n    }\n  }\n": types.DashboardFragmentDoc,
    "\n  mutation CreateSpaceMutation {\n    result: createSpace {\n      id\n      name\n      updatedAt\n    }\n  }\n": types.CreateSpaceMutationDocument,
    "\n  mutation CreatePlaceholderUserAndExampleSpaceMutation {\n    result: createPlaceholderUserAndExampleSpace {\n      placeholderClientToken\n      space {\n        id\n      }\n    }\n  }\n": types.CreatePlaceholderUserAndExampleSpaceMutationDocument,
    "\n  query HeaderQuery {\n    isLoggedIn\n    isPlaceholderUserTokenInvalid\n    user {\n      id\n      email\n      profilePictureUrl\n    }\n  }\n": types.HeaderQueryDocument,
    "\n  mutation MergePlaceholderUserWithLoggedInUserMutation(\n    $placeholderUserToken: String!\n  ) {\n    result: mergePlaceholderUserWithLoggedInUser(\n      placeholderUserToken: $placeholderUserToken\n    ) {\n      id\n      spaces {\n        id\n      }\n    }\n  }\n": types.MergePlaceholderUserWithLoggedInUserMutationDocument,
    "\n  query RootRouteQuery {\n    user {\n      id\n      ...Dashboard\n    }\n  }\n": types.RootRouteQueryDocument,
    "\n  query SpaceQuery($spaceId: UUID!) {\n    result: space(id: $spaceId) {\n      isReadOnly\n      space {\n        id\n        name\n        contentVersion\n        content\n      }\n    }\n  }\n": types.SpaceQueryDocument,
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
export function graphql(source: "\n  query SpaceContentVersionQuery($spaceId: UUID!) {\n    space(id: $spaceId) {\n      isReadOnly\n      space {\n        id\n        contentVersion\n      }\n    }\n  }\n"): (typeof documents)["\n  query SpaceContentVersionQuery($spaceId: UUID!) {\n    space(id: $spaceId) {\n      isReadOnly\n      space {\n        id\n        contentVersion\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query HeaderSpaceNameQuery($spaceId: UUID!) {\n    result: space(id: $spaceId) {\n      isReadOnly\n      space {\n        id\n        name\n      }\n    }\n  }\n"): (typeof documents)["\n  query HeaderSpaceNameQuery($spaceId: UUID!) {\n    result: space(id: $spaceId) {\n      isReadOnly\n      space {\n        id\n        name\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query EvaluationModeCSVContentQuery($spaceId: UUID!, $presetId: ID!) {\n    result: space(id: $spaceId) {\n      space {\n        id\n        csvEvaluationPreset(id: $presetId) {\n          id\n          csvContent\n          configContent\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  query EvaluationModeCSVContentQuery($spaceId: UUID!, $presetId: ID!) {\n    result: space(id: $spaceId) {\n      space {\n        id\n        csvEvaluationPreset(id: $presetId) {\n          id\n          csvContent\n          configContent\n        }\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query PresetSelectorQuery($spaceId: UUID!) {\n    result: space(id: $spaceId) {\n      space {\n        id\n        csvEvaluationPresets {\n          id\n          name\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  query PresetSelectorQuery($spaceId: UUID!) {\n    result: space(id: $spaceId) {\n      space {\n        id\n        csvEvaluationPresets {\n          id\n          name\n        }\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query SpaceFlowQuery($spaceId: UUID!) {\n    result: space(id: $spaceId) {\n      space {\n        id\n        name\n        contentVersion\n        flowContent\n        contentV3\n      }\n    }\n  }\n"): (typeof documents)["\n  query SpaceFlowQuery($spaceId: UUID!) {\n    result: space(id: $spaceId) {\n      space {\n        id\n        name\n        contentVersion\n        flowContent\n        contentV3\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation UpdateSpaceContentV3Mutation($spaceId: ID!, $contentV3: String!) {\n    updateSpace(id: $spaceId, contentVersion: v3, contentV3: $contentV3) {\n      id\n      contentV3\n    }\n  }\n"): (typeof documents)["\n  mutation UpdateSpaceContentV3Mutation($spaceId: ID!, $contentV3: String!) {\n    updateSpace(id: $spaceId, contentVersion: v3, contentV3: $contentV3) {\n      id\n      contentV3\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation CreateCsvEvaluationPresetMutation(\n    $spaceId: ID!\n    $name: String!\n    $csvContent: String\n  ) {\n    result: createCsvEvaluationPreset(\n      spaceId: $spaceId\n      name: $name\n      csvContent: $csvContent\n    ) {\n      space {\n        id\n        csvEvaluationPresets {\n          id\n        }\n      }\n      csvEvaluationPreset {\n        id\n        name\n        csvContent\n        configContent\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation CreateCsvEvaluationPresetMutation(\n    $spaceId: ID!\n    $name: String!\n    $csvContent: String\n  ) {\n    result: createCsvEvaluationPreset(\n      spaceId: $spaceId\n      name: $name\n      csvContent: $csvContent\n    ) {\n      space {\n        id\n        csvEvaluationPresets {\n          id\n        }\n      }\n      csvEvaluationPreset {\n        id\n        name\n        csvContent\n        configContent\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation UpdateCsvEvaluationPresetMutation(\n    $presetId: ID!\n    $name: String\n    $csvContent: String\n  ) {\n    updateCsvEvaluationPreset(\n      presetId: $presetId\n      name: $name\n      csvContent: $csvContent\n    ) {\n      id\n      name\n      csvContent\n      configContent\n    }\n  }\n"): (typeof documents)["\n  mutation UpdateCsvEvaluationPresetMutation(\n    $presetId: ID!\n    $name: String\n    $csvContent: String\n  ) {\n    updateCsvEvaluationPreset(\n      presetId: $presetId\n      name: $name\n      csvContent: $csvContent\n    ) {\n      id\n      name\n      csvContent\n      configContent\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation DeleteCsvEvaluationPresetMutation($presetId: ID!) {\n    space: deleteCsvEvaluationPreset(id: $presetId) {\n      id\n      csvEvaluationPresets {\n        id\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation DeleteCsvEvaluationPresetMutation($presetId: ID!) {\n    space: deleteCsvEvaluationPreset(id: $presetId) {\n      id\n      csvEvaluationPresets {\n        id\n      }\n    }\n  }\n"];
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
export function graphql(source: "\n  mutation CreatePlaceholderUserAndExampleSpaceMutation {\n    result: createPlaceholderUserAndExampleSpace {\n      placeholderClientToken\n      space {\n        id\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation CreatePlaceholderUserAndExampleSpaceMutation {\n    result: createPlaceholderUserAndExampleSpace {\n      placeholderClientToken\n      space {\n        id\n      }\n    }\n  }\n"];
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
export function graphql(source: "\n  query SpaceQuery($spaceId: UUID!) {\n    result: space(id: $spaceId) {\n      isReadOnly\n      space {\n        id\n        name\n        contentVersion\n        content\n      }\n    }\n  }\n"): (typeof documents)["\n  query SpaceQuery($spaceId: UUID!) {\n    result: space(id: $spaceId) {\n      isReadOnly\n      space {\n        id\n        name\n        contentVersion\n        content\n      }\n    }\n  }\n"];
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