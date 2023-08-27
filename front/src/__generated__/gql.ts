/* eslint-disable */
import { TypedDocumentNode as DocumentNode } from "@graphql-typed-document-node/core";
import * as types from "./graphql";

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
  "\n  fragment DraggingBlock on Block {\n    id\n    __typename\n    ... on PromptBlock {\n      role\n      content\n    }\n    ... on CompleterBlock {\n      model\n      temperature\n      stop\n    }\n  }\n":
    types.DraggingBlockFragmentDoc,
  "\n  fragment LibraryBlock on Block {\n    id\n    __typename\n    ... on PromptBlock {\n      role\n      content\n    }\n    ... on CompleterBlock {\n      model\n      temperature\n      stop\n    }\n  }\n":
    types.LibraryBlockFragmentDoc,
  "\n  query HeaderQuery {\n    isLoggedIn\n    user {\n      email\n    }\n  }\n":
    types.HeaderQueryDocument,
  "\n  query RootRouteQuery {\n    user {\n      id\n      ...Dashboard\n    }\n  }\n":
    types.RootRouteQueryDocument,
  "\n  mutation CreateExampleSpaceMutation {\n    createExampleSpace {\n      isSuccess\n      placeholderClientToken\n      space {\n        id\n      }\n    }\n  }\n":
    types.CreateExampleSpaceMutationDocument,
  "\n  fragment Dashboard on User {\n    workspaces {\n      id\n      name\n      updatedAt\n    }\n  }\n":
    types.DashboardFragmentDoc,
  "\n  mutation CreateSpaceMutation {\n    createSpace {\n      id\n    }\n  }\n":
    types.CreateSpaceMutationDocument,
  "\n  fragment WorkspaceQuery on Query {\n    workspace(workspaceId: $workspaceId) {\n      firstPreset {\n        id\n        blockSets {\n          id\n          position\n        }\n      }\n    }\n    ...WorkspaceContent\n  }\n":
    types.WorkspaceQueryFragmentDoc,
  "\n  mutation AddPromptToBlockSetTopInputMutation(\n    $promptBlockId: UUID!\n    $blockSetId: UUID!\n  ) {\n    addPromptToBlockSetTopInput(\n      promptBlockId: $promptBlockId\n      blockSetId: $blockSetId\n    ) {\n      id\n    }\n  }\n":
    types.AddPromptToBlockSetTopInputMutationDocument,
  "\n  mutation AddCompleterToBlockSetMutation(\n    $blockSetId: UUID!\n    $completerBlockId: UUID!\n  ) {\n    addCompleterToBlockSet(\n      blockSetId: $blockSetId\n      completerBlockId: $completerBlockId\n    ) {\n      id\n    }\n  }\n":
    types.AddCompleterToBlockSetMutationDocument,
  "\n  mutation AddSystemPromptToBlockSetMutation(\n    $blockSetId: UUID!\n    $promptBlockId: UUID!\n  ) {\n    addSystemPromptToBlockSet(\n      blockSetId: $blockSetId\n      promptBlockId: $promptBlockId\n    ) {\n      id\n    }\n  }\n":
    types.AddSystemPromptToBlockSetMutationDocument,
  "\n  mutation AddPromptToBlockSetTopOutputMutation(\n    $promptBlockId: UUID!\n    $blockSetId: UUID!\n  ) {\n    addPromptToBlockSetTopOutput(\n      promptBlockId: $promptBlockId\n      blockSetId: $blockSetId\n    ) {\n      id\n    }\n  }\n":
    types.AddPromptToBlockSetTopOutputMutationDocument,
  "\n  mutation SwapBlockSetPositionsMutation(\n    $movingBlockSetId: UUID!\n    $slotBlockSetId: UUID!\n  ) {\n    swapBlockSetPositions(\n      movingBlockSetId: $movingBlockSetId\n      slotBlockSetId: $slotBlockSetId\n    ) {\n      id\n      blockSets {\n        id\n        position\n      }\n    }\n  }\n":
    types.SwapBlockSetPositionsMutationDocument,
  "\n  fragment WorkspaceContent on Query {\n    workspace(workspaceId: $workspaceId) {\n      id\n      ...Library\n      firstPreset {\n        id\n        ...Simulator\n      }\n    }\n  }\n":
    types.WorkspaceContentFragmentDoc,
  "\n  query WorkspaceRouteQuery(\n    $workspaceId: UUID!\n  ) {\n    user {\n      id\n    }\n    ...SubHeaderFragment\n    ...WorkspaceQuery\n  }\n":
    types.WorkspaceRouteQueryDocument,
  "\n  fragment EditorBlockSet on BlockSet {\n    id\n    isInputIncludingPreviousBlockSetOutput\n    isOutputIncludingInputBlocks\n    isRepeatingCurrentBlockSet\n  }\n":
    types.EditorBlockSetFragmentDoc,
  "\n  mutation UpdateBlockSetOptionsMutation(\n    $blockSetId: UUID!\n    $isInputIncludingPreviousBlockSetOutput: Boolean!\n    $isOutputIncludingInputBlocks: Boolean!\n    $isRepeatingCurrentBlockSet: Boolean!\n  ) {\n    updateBlockSetOptions(\n      blockSetId: $blockSetId\n      isInputIncludingPreviousBlockSetOutput: $isInputIncludingPreviousBlockSetOutput\n      isOutputIncludingInputBlocks: $isOutputIncludingInputBlocks\n      isRepeatingCurrentBlockSet: $isRepeatingCurrentBlockSet\n    ) {\n      id\n    }\n  }\n":
    types.UpdateBlockSetOptionsMutationDocument,
  "\n  mutation DeleteBlockSetMutation(\n    $blockSetId: UUID!\n  ) {\n    deleteBlockSet(\n      blockSetId: $blockSetId\n    ) {\n      isSuccess\n    }\n  }\n":
    types.DeleteBlockSetMutationDocument,
  "\n  fragment SelectedCompleterBlock on CompleterBlock {\n    id\n    model\n    temperature\n    stop\n  }\n":
    types.SelectedCompleterBlockFragmentDoc,
  "\n  mutation DeleteCompleterBlockMutation(\n    $blockId: UUID!\n  ) {\n    deleteBlock(\n      blockId: $blockId\n    ) {\n      isSuccess\n    }\n  }\n":
    types.DeleteCompleterBlockMutationDocument,
  "\n  mutation UpdateCompleterBlockMutation(\n    $id: UUID!\n    $model: String!\n    $temperature: Float!\n    $stop: String!\n  ) {\n    updateCompleterBlock(\n      id: $id\n      model: $model\n      temperature: $temperature\n      stop: $stop\n    ) {\n      id\n    }\n  }\n":
    types.UpdateCompleterBlockMutationDocument,
  "\n  fragment SelectedBlock on PromptBlock {\n    id\n    role\n    content\n  }\n":
    types.SelectedBlockFragmentDoc,
  "\n  mutation DeletePromptBlockMutation(\n    $blockId: UUID!\n  ) {\n    deleteBlock(\n      blockId: $blockId\n    ) {\n      isSuccess\n    }\n  }\n":
    types.DeletePromptBlockMutationDocument,
  "\n  mutation UpdateBlockMutation(\n    $id: UUID!\n    $role: PromptType!\n    $content: String!\n  ) {\n    updatePromptBlock(\n      id: $id\n      role: $role\n      content: $content\n    ) {\n      id\n    }\n  }\n":
    types.UpdateBlockMutationDocument,
  "\n  fragment Library on Workspace {\n    blocks {\n      id\n      __typename\n      ...LibraryBlock\n    }\n  }\n":
    types.LibraryFragmentDoc,
  "\n  fragment SimulatorBlockSet on BlockSet {\n    id\n    position\n    isInputIncludingPreviousBlockSetOutput\n    isOutputIncludingInputBlocks\n    isRepeatingCurrentBlockSet\n    topInputPromptBlock {\n      id\n      ...SimulatorBlock\n    }\n    systemPromptBlock {\n      id\n      ...SimulatorBlock\n    }\n    completerBlock {\n      id\n      ...SimulatorBlock\n    }\n    topOutputBlock {\n      id\n      ...SimulatorBlock\n    }\n    previousBlockSetsInputBlocks {\n      id\n      role\n      ...SimulatorBlock\n    }\n  }\n":
    types.SimulatorBlockSetFragmentDoc,
  "\n  mutation RemoveTopInputFromBlockSetMutation(\n    $blockSetId: UUID!\n  ) {\n    removeTopInputFromBlockSet(\n      blockSetId: $blockSetId\n    ) {\n      id\n    }\n  }\n":
    types.RemoveTopInputFromBlockSetMutationDocument,
  "\n  mutation RemoveSystemPromptFromBlockSetMutation(\n    $blockSetId: UUID!\n  ) {\n    removeSystemPromptFromBlockSet(\n      blockSetId: $blockSetId\n    ) {\n      id\n    }\n  }\n":
    types.RemoveSystemPromptFromBlockSetMutationDocument,
  "\n  mutation RemoveCompleterFromBlockSetMutation(\n    $blockSetId: UUID!\n  ) {\n    removeCompleterFromBlockSet(\n      blockSetId: $blockSetId\n    ) {\n      id\n    }\n  }\n":
    types.RemoveCompleterFromBlockSetMutationDocument,
  "\n  mutation RemoveTopOutputFromBlockSetMutation(\n    $blockSetId: UUID!\n  ) {\n    removeTopOutputFromBlockSet(\n      blockSetId: $blockSetId\n    ) {\n      id\n    }\n  }\n":
    types.RemoveTopOutputFromBlockSetMutationDocument,
  "\n  fragment Simulator on Preset {\n    id\n    blockSets {\n      id\n      ...SimulatorBlockSet\n    }\n  }\n":
    types.SimulatorFragmentDoc,
  "\n  fragment SimulatorBlock on Block {\n    id\n    __typename\n    ... on PromptBlock {\n      role\n      content\n    }\n    ... on CompleterBlock {\n      model\n      temperature\n      stop\n    }\n  }\n":
    types.SimulatorBlockFragmentDoc,
  "\n  fragment RunButtonFragment on Preset {\n    blockSets {\n      id\n      topInputPromptBlock {\n        id\n        role\n        content\n      }\n      systemPromptBlock {\n        id\n        content\n      }\n      completerBlock {\n        id\n        model\n        temperature\n        stop\n      }\n    }\n  }\n":
    types.RunButtonFragmentFragmentDoc,
  "\n  fragment SubHeaderBlockSetFragment on BlockSet {\n    id\n    position\n    isInputIncludingPreviousBlockSetOutput\n    isOutputIncludingInputBlocks\n    isRepeatingCurrentBlockSet\n    topInputPromptBlock {\n      id\n      role\n      content\n    }\n    systemPromptBlock {\n      id\n      content\n    }\n    completerBlock {\n      id\n      model\n      temperature\n      stop\n    }\n    topOutputBlock {\n      id\n      content\n    }\n    previousBlockSetsInputBlocks {\n      id\n      role\n      content\n    }\n  }\n":
    types.SubHeaderBlockSetFragmentFragmentDoc,
  "\n  mutation CreateTopOutputBlockOnBlockSetMutation(\n    $blockSetId: UUID!\n  ) {\n    createTopOutputBlockOnBlockSet(\n      blockSetId: $blockSetId\n    ) {\n      id\n      topOutputBlock {\n        id\n      }\n    }\n  }\n":
    types.CreateTopOutputBlockOnBlockSetMutationDocument,
  "\n  mutation UpdatePromptBlockMutation(\n    $id: UUID!\n    $content: String!\n  ) {\n    updatePromptBlock(\n      id: $id\n      role: Assistant\n      content: $content\n    ) {\n      id\n    }\n  }\n":
    types.UpdatePromptBlockMutationDocument,
  "\n  fragment SubHeaderFragment on Query {\n    workspace(workspaceId: $workspaceId) {\n      name\n      firstPreset {\n        id\n        ...RunButtonFragment\n      }\n    }\n  }\n":
    types.SubHeaderFragmentFragmentDoc,
  "\n  mutation CreatePromptBlockMutation($workspaceId: UUID!) {\n    createPromptBlock(workspaceId: $workspaceId) {\n      id\n    }\n  }\n":
    types.CreatePromptBlockMutationDocument,
  "\n  mutation CreateCompleterBlock($workspaceId: UUID!) {\n    createCompleterBlock(workspaceId: $workspaceId) {\n      id\n    }\n  }\n":
    types.CreateCompleterBlockDocument,
  "\n  mutation CreateBlockSet($presetId: UUID!) {\n    createBlockSet(presetId: $presetId) {\n      id\n    }\n  }\n":
    types.CreateBlockSetDocument,
  "\n  mutation UpdateSpaceMutation(\n    $workspaceId: UUID!\n    $name: String!\n  ) {\n    updateSpace(\n      id: $workspaceId\n      name: $name\n    ) {\n      id\n    }\n  }\n":
    types.UpdateSpaceMutationDocument,
  "\n  mutation DeleteSpaceMutation($workspaceId: UUID!) {\n    deleteSpace(id: $workspaceId) {\n      isSuccess\n    }\n  }\n":
    types.DeleteSpaceMutationDocument,
  "\n  query SpaceV2Query($spaceId: UUID!) {\n    spaceV2(id: $spaceId) {\n      id\n      name\n      content\n    }\n  }\n":
    types.SpaceV2QueryDocument,
  "\n  mutation UpdateSpaceV2Mutation($spaceId: UUID!, $content: String!) {\n    updateSpaceV2(id: $spaceId, content: $content) {\n      id\n      name\n      content\n    }\n  }\n":
    types.UpdateSpaceV2MutationDocument,
};

/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = gql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function gql(source: string): unknown;

/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  fragment DraggingBlock on Block {\n    id\n    __typename\n    ... on PromptBlock {\n      role\n      content\n    }\n    ... on CompleterBlock {\n      model\n      temperature\n      stop\n    }\n  }\n"
): (typeof documents)["\n  fragment DraggingBlock on Block {\n    id\n    __typename\n    ... on PromptBlock {\n      role\n      content\n    }\n    ... on CompleterBlock {\n      model\n      temperature\n      stop\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  fragment LibraryBlock on Block {\n    id\n    __typename\n    ... on PromptBlock {\n      role\n      content\n    }\n    ... on CompleterBlock {\n      model\n      temperature\n      stop\n    }\n  }\n"
): (typeof documents)["\n  fragment LibraryBlock on Block {\n    id\n    __typename\n    ... on PromptBlock {\n      role\n      content\n    }\n    ... on CompleterBlock {\n      model\n      temperature\n      stop\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  query HeaderQuery {\n    isLoggedIn\n    user {\n      email\n    }\n  }\n"
): (typeof documents)["\n  query HeaderQuery {\n    isLoggedIn\n    user {\n      email\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  query RootRouteQuery {\n    user {\n      id\n      ...Dashboard\n    }\n  }\n"
): (typeof documents)["\n  query RootRouteQuery {\n    user {\n      id\n      ...Dashboard\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  mutation CreateExampleSpaceMutation {\n    createExampleSpace {\n      isSuccess\n      placeholderClientToken\n      space {\n        id\n      }\n    }\n  }\n"
): (typeof documents)["\n  mutation CreateExampleSpaceMutation {\n    createExampleSpace {\n      isSuccess\n      placeholderClientToken\n      space {\n        id\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  fragment Dashboard on User {\n    workspaces {\n      id\n      name\n      updatedAt\n    }\n  }\n"
): (typeof documents)["\n  fragment Dashboard on User {\n    workspaces {\n      id\n      name\n      updatedAt\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  mutation CreateSpaceMutation {\n    createSpace {\n      id\n    }\n  }\n"
): (typeof documents)["\n  mutation CreateSpaceMutation {\n    createSpace {\n      id\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  fragment WorkspaceQuery on Query {\n    workspace(workspaceId: $workspaceId) {\n      firstPreset {\n        id\n        blockSets {\n          id\n          position\n        }\n      }\n    }\n    ...WorkspaceContent\n  }\n"
): (typeof documents)["\n  fragment WorkspaceQuery on Query {\n    workspace(workspaceId: $workspaceId) {\n      firstPreset {\n        id\n        blockSets {\n          id\n          position\n        }\n      }\n    }\n    ...WorkspaceContent\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  mutation AddPromptToBlockSetTopInputMutation(\n    $promptBlockId: UUID!\n    $blockSetId: UUID!\n  ) {\n    addPromptToBlockSetTopInput(\n      promptBlockId: $promptBlockId\n      blockSetId: $blockSetId\n    ) {\n      id\n    }\n  }\n"
): (typeof documents)["\n  mutation AddPromptToBlockSetTopInputMutation(\n    $promptBlockId: UUID!\n    $blockSetId: UUID!\n  ) {\n    addPromptToBlockSetTopInput(\n      promptBlockId: $promptBlockId\n      blockSetId: $blockSetId\n    ) {\n      id\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  mutation AddCompleterToBlockSetMutation(\n    $blockSetId: UUID!\n    $completerBlockId: UUID!\n  ) {\n    addCompleterToBlockSet(\n      blockSetId: $blockSetId\n      completerBlockId: $completerBlockId\n    ) {\n      id\n    }\n  }\n"
): (typeof documents)["\n  mutation AddCompleterToBlockSetMutation(\n    $blockSetId: UUID!\n    $completerBlockId: UUID!\n  ) {\n    addCompleterToBlockSet(\n      blockSetId: $blockSetId\n      completerBlockId: $completerBlockId\n    ) {\n      id\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  mutation AddSystemPromptToBlockSetMutation(\n    $blockSetId: UUID!\n    $promptBlockId: UUID!\n  ) {\n    addSystemPromptToBlockSet(\n      blockSetId: $blockSetId\n      promptBlockId: $promptBlockId\n    ) {\n      id\n    }\n  }\n"
): (typeof documents)["\n  mutation AddSystemPromptToBlockSetMutation(\n    $blockSetId: UUID!\n    $promptBlockId: UUID!\n  ) {\n    addSystemPromptToBlockSet(\n      blockSetId: $blockSetId\n      promptBlockId: $promptBlockId\n    ) {\n      id\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  mutation AddPromptToBlockSetTopOutputMutation(\n    $promptBlockId: UUID!\n    $blockSetId: UUID!\n  ) {\n    addPromptToBlockSetTopOutput(\n      promptBlockId: $promptBlockId\n      blockSetId: $blockSetId\n    ) {\n      id\n    }\n  }\n"
): (typeof documents)["\n  mutation AddPromptToBlockSetTopOutputMutation(\n    $promptBlockId: UUID!\n    $blockSetId: UUID!\n  ) {\n    addPromptToBlockSetTopOutput(\n      promptBlockId: $promptBlockId\n      blockSetId: $blockSetId\n    ) {\n      id\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  mutation SwapBlockSetPositionsMutation(\n    $movingBlockSetId: UUID!\n    $slotBlockSetId: UUID!\n  ) {\n    swapBlockSetPositions(\n      movingBlockSetId: $movingBlockSetId\n      slotBlockSetId: $slotBlockSetId\n    ) {\n      id\n      blockSets {\n        id\n        position\n      }\n    }\n  }\n"
): (typeof documents)["\n  mutation SwapBlockSetPositionsMutation(\n    $movingBlockSetId: UUID!\n    $slotBlockSetId: UUID!\n  ) {\n    swapBlockSetPositions(\n      movingBlockSetId: $movingBlockSetId\n      slotBlockSetId: $slotBlockSetId\n    ) {\n      id\n      blockSets {\n        id\n        position\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  fragment WorkspaceContent on Query {\n    workspace(workspaceId: $workspaceId) {\n      id\n      ...Library\n      firstPreset {\n        id\n        ...Simulator\n      }\n    }\n  }\n"
): (typeof documents)["\n  fragment WorkspaceContent on Query {\n    workspace(workspaceId: $workspaceId) {\n      id\n      ...Library\n      firstPreset {\n        id\n        ...Simulator\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  query WorkspaceRouteQuery(\n    $workspaceId: UUID!\n  ) {\n    user {\n      id\n    }\n    ...SubHeaderFragment\n    ...WorkspaceQuery\n  }\n"
): (typeof documents)["\n  query WorkspaceRouteQuery(\n    $workspaceId: UUID!\n  ) {\n    user {\n      id\n    }\n    ...SubHeaderFragment\n    ...WorkspaceQuery\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  fragment EditorBlockSet on BlockSet {\n    id\n    isInputIncludingPreviousBlockSetOutput\n    isOutputIncludingInputBlocks\n    isRepeatingCurrentBlockSet\n  }\n"
): (typeof documents)["\n  fragment EditorBlockSet on BlockSet {\n    id\n    isInputIncludingPreviousBlockSetOutput\n    isOutputIncludingInputBlocks\n    isRepeatingCurrentBlockSet\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  mutation UpdateBlockSetOptionsMutation(\n    $blockSetId: UUID!\n    $isInputIncludingPreviousBlockSetOutput: Boolean!\n    $isOutputIncludingInputBlocks: Boolean!\n    $isRepeatingCurrentBlockSet: Boolean!\n  ) {\n    updateBlockSetOptions(\n      blockSetId: $blockSetId\n      isInputIncludingPreviousBlockSetOutput: $isInputIncludingPreviousBlockSetOutput\n      isOutputIncludingInputBlocks: $isOutputIncludingInputBlocks\n      isRepeatingCurrentBlockSet: $isRepeatingCurrentBlockSet\n    ) {\n      id\n    }\n  }\n"
): (typeof documents)["\n  mutation UpdateBlockSetOptionsMutation(\n    $blockSetId: UUID!\n    $isInputIncludingPreviousBlockSetOutput: Boolean!\n    $isOutputIncludingInputBlocks: Boolean!\n    $isRepeatingCurrentBlockSet: Boolean!\n  ) {\n    updateBlockSetOptions(\n      blockSetId: $blockSetId\n      isInputIncludingPreviousBlockSetOutput: $isInputIncludingPreviousBlockSetOutput\n      isOutputIncludingInputBlocks: $isOutputIncludingInputBlocks\n      isRepeatingCurrentBlockSet: $isRepeatingCurrentBlockSet\n    ) {\n      id\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  mutation DeleteBlockSetMutation(\n    $blockSetId: UUID!\n  ) {\n    deleteBlockSet(\n      blockSetId: $blockSetId\n    ) {\n      isSuccess\n    }\n  }\n"
): (typeof documents)["\n  mutation DeleteBlockSetMutation(\n    $blockSetId: UUID!\n  ) {\n    deleteBlockSet(\n      blockSetId: $blockSetId\n    ) {\n      isSuccess\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  fragment SelectedCompleterBlock on CompleterBlock {\n    id\n    model\n    temperature\n    stop\n  }\n"
): (typeof documents)["\n  fragment SelectedCompleterBlock on CompleterBlock {\n    id\n    model\n    temperature\n    stop\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  mutation DeleteCompleterBlockMutation(\n    $blockId: UUID!\n  ) {\n    deleteBlock(\n      blockId: $blockId\n    ) {\n      isSuccess\n    }\n  }\n"
): (typeof documents)["\n  mutation DeleteCompleterBlockMutation(\n    $blockId: UUID!\n  ) {\n    deleteBlock(\n      blockId: $blockId\n    ) {\n      isSuccess\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  mutation UpdateCompleterBlockMutation(\n    $id: UUID!\n    $model: String!\n    $temperature: Float!\n    $stop: String!\n  ) {\n    updateCompleterBlock(\n      id: $id\n      model: $model\n      temperature: $temperature\n      stop: $stop\n    ) {\n      id\n    }\n  }\n"
): (typeof documents)["\n  mutation UpdateCompleterBlockMutation(\n    $id: UUID!\n    $model: String!\n    $temperature: Float!\n    $stop: String!\n  ) {\n    updateCompleterBlock(\n      id: $id\n      model: $model\n      temperature: $temperature\n      stop: $stop\n    ) {\n      id\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  fragment SelectedBlock on PromptBlock {\n    id\n    role\n    content\n  }\n"
): (typeof documents)["\n  fragment SelectedBlock on PromptBlock {\n    id\n    role\n    content\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  mutation DeletePromptBlockMutation(\n    $blockId: UUID!\n  ) {\n    deleteBlock(\n      blockId: $blockId\n    ) {\n      isSuccess\n    }\n  }\n"
): (typeof documents)["\n  mutation DeletePromptBlockMutation(\n    $blockId: UUID!\n  ) {\n    deleteBlock(\n      blockId: $blockId\n    ) {\n      isSuccess\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  mutation UpdateBlockMutation(\n    $id: UUID!\n    $role: PromptType!\n    $content: String!\n  ) {\n    updatePromptBlock(\n      id: $id\n      role: $role\n      content: $content\n    ) {\n      id\n    }\n  }\n"
): (typeof documents)["\n  mutation UpdateBlockMutation(\n    $id: UUID!\n    $role: PromptType!\n    $content: String!\n  ) {\n    updatePromptBlock(\n      id: $id\n      role: $role\n      content: $content\n    ) {\n      id\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  fragment Library on Workspace {\n    blocks {\n      id\n      __typename\n      ...LibraryBlock\n    }\n  }\n"
): (typeof documents)["\n  fragment Library on Workspace {\n    blocks {\n      id\n      __typename\n      ...LibraryBlock\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  fragment SimulatorBlockSet on BlockSet {\n    id\n    position\n    isInputIncludingPreviousBlockSetOutput\n    isOutputIncludingInputBlocks\n    isRepeatingCurrentBlockSet\n    topInputPromptBlock {\n      id\n      ...SimulatorBlock\n    }\n    systemPromptBlock {\n      id\n      ...SimulatorBlock\n    }\n    completerBlock {\n      id\n      ...SimulatorBlock\n    }\n    topOutputBlock {\n      id\n      ...SimulatorBlock\n    }\n    previousBlockSetsInputBlocks {\n      id\n      role\n      ...SimulatorBlock\n    }\n  }\n"
): (typeof documents)["\n  fragment SimulatorBlockSet on BlockSet {\n    id\n    position\n    isInputIncludingPreviousBlockSetOutput\n    isOutputIncludingInputBlocks\n    isRepeatingCurrentBlockSet\n    topInputPromptBlock {\n      id\n      ...SimulatorBlock\n    }\n    systemPromptBlock {\n      id\n      ...SimulatorBlock\n    }\n    completerBlock {\n      id\n      ...SimulatorBlock\n    }\n    topOutputBlock {\n      id\n      ...SimulatorBlock\n    }\n    previousBlockSetsInputBlocks {\n      id\n      role\n      ...SimulatorBlock\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  mutation RemoveTopInputFromBlockSetMutation(\n    $blockSetId: UUID!\n  ) {\n    removeTopInputFromBlockSet(\n      blockSetId: $blockSetId\n    ) {\n      id\n    }\n  }\n"
): (typeof documents)["\n  mutation RemoveTopInputFromBlockSetMutation(\n    $blockSetId: UUID!\n  ) {\n    removeTopInputFromBlockSet(\n      blockSetId: $blockSetId\n    ) {\n      id\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  mutation RemoveSystemPromptFromBlockSetMutation(\n    $blockSetId: UUID!\n  ) {\n    removeSystemPromptFromBlockSet(\n      blockSetId: $blockSetId\n    ) {\n      id\n    }\n  }\n"
): (typeof documents)["\n  mutation RemoveSystemPromptFromBlockSetMutation(\n    $blockSetId: UUID!\n  ) {\n    removeSystemPromptFromBlockSet(\n      blockSetId: $blockSetId\n    ) {\n      id\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  mutation RemoveCompleterFromBlockSetMutation(\n    $blockSetId: UUID!\n  ) {\n    removeCompleterFromBlockSet(\n      blockSetId: $blockSetId\n    ) {\n      id\n    }\n  }\n"
): (typeof documents)["\n  mutation RemoveCompleterFromBlockSetMutation(\n    $blockSetId: UUID!\n  ) {\n    removeCompleterFromBlockSet(\n      blockSetId: $blockSetId\n    ) {\n      id\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  mutation RemoveTopOutputFromBlockSetMutation(\n    $blockSetId: UUID!\n  ) {\n    removeTopOutputFromBlockSet(\n      blockSetId: $blockSetId\n    ) {\n      id\n    }\n  }\n"
): (typeof documents)["\n  mutation RemoveTopOutputFromBlockSetMutation(\n    $blockSetId: UUID!\n  ) {\n    removeTopOutputFromBlockSet(\n      blockSetId: $blockSetId\n    ) {\n      id\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  fragment Simulator on Preset {\n    id\n    blockSets {\n      id\n      ...SimulatorBlockSet\n    }\n  }\n"
): (typeof documents)["\n  fragment Simulator on Preset {\n    id\n    blockSets {\n      id\n      ...SimulatorBlockSet\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  fragment SimulatorBlock on Block {\n    id\n    __typename\n    ... on PromptBlock {\n      role\n      content\n    }\n    ... on CompleterBlock {\n      model\n      temperature\n      stop\n    }\n  }\n"
): (typeof documents)["\n  fragment SimulatorBlock on Block {\n    id\n    __typename\n    ... on PromptBlock {\n      role\n      content\n    }\n    ... on CompleterBlock {\n      model\n      temperature\n      stop\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  fragment RunButtonFragment on Preset {\n    blockSets {\n      id\n      topInputPromptBlock {\n        id\n        role\n        content\n      }\n      systemPromptBlock {\n        id\n        content\n      }\n      completerBlock {\n        id\n        model\n        temperature\n        stop\n      }\n    }\n  }\n"
): (typeof documents)["\n  fragment RunButtonFragment on Preset {\n    blockSets {\n      id\n      topInputPromptBlock {\n        id\n        role\n        content\n      }\n      systemPromptBlock {\n        id\n        content\n      }\n      completerBlock {\n        id\n        model\n        temperature\n        stop\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  fragment SubHeaderBlockSetFragment on BlockSet {\n    id\n    position\n    isInputIncludingPreviousBlockSetOutput\n    isOutputIncludingInputBlocks\n    isRepeatingCurrentBlockSet\n    topInputPromptBlock {\n      id\n      role\n      content\n    }\n    systemPromptBlock {\n      id\n      content\n    }\n    completerBlock {\n      id\n      model\n      temperature\n      stop\n    }\n    topOutputBlock {\n      id\n      content\n    }\n    previousBlockSetsInputBlocks {\n      id\n      role\n      content\n    }\n  }\n"
): (typeof documents)["\n  fragment SubHeaderBlockSetFragment on BlockSet {\n    id\n    position\n    isInputIncludingPreviousBlockSetOutput\n    isOutputIncludingInputBlocks\n    isRepeatingCurrentBlockSet\n    topInputPromptBlock {\n      id\n      role\n      content\n    }\n    systemPromptBlock {\n      id\n      content\n    }\n    completerBlock {\n      id\n      model\n      temperature\n      stop\n    }\n    topOutputBlock {\n      id\n      content\n    }\n    previousBlockSetsInputBlocks {\n      id\n      role\n      content\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  mutation CreateTopOutputBlockOnBlockSetMutation(\n    $blockSetId: UUID!\n  ) {\n    createTopOutputBlockOnBlockSet(\n      blockSetId: $blockSetId\n    ) {\n      id\n      topOutputBlock {\n        id\n      }\n    }\n  }\n"
): (typeof documents)["\n  mutation CreateTopOutputBlockOnBlockSetMutation(\n    $blockSetId: UUID!\n  ) {\n    createTopOutputBlockOnBlockSet(\n      blockSetId: $blockSetId\n    ) {\n      id\n      topOutputBlock {\n        id\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  mutation UpdatePromptBlockMutation(\n    $id: UUID!\n    $content: String!\n  ) {\n    updatePromptBlock(\n      id: $id\n      role: Assistant\n      content: $content\n    ) {\n      id\n    }\n  }\n"
): (typeof documents)["\n  mutation UpdatePromptBlockMutation(\n    $id: UUID!\n    $content: String!\n  ) {\n    updatePromptBlock(\n      id: $id\n      role: Assistant\n      content: $content\n    ) {\n      id\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  fragment SubHeaderFragment on Query {\n    workspace(workspaceId: $workspaceId) {\n      name\n      firstPreset {\n        id\n        ...RunButtonFragment\n      }\n    }\n  }\n"
): (typeof documents)["\n  fragment SubHeaderFragment on Query {\n    workspace(workspaceId: $workspaceId) {\n      name\n      firstPreset {\n        id\n        ...RunButtonFragment\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  mutation CreatePromptBlockMutation($workspaceId: UUID!) {\n    createPromptBlock(workspaceId: $workspaceId) {\n      id\n    }\n  }\n"
): (typeof documents)["\n  mutation CreatePromptBlockMutation($workspaceId: UUID!) {\n    createPromptBlock(workspaceId: $workspaceId) {\n      id\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  mutation CreateCompleterBlock($workspaceId: UUID!) {\n    createCompleterBlock(workspaceId: $workspaceId) {\n      id\n    }\n  }\n"
): (typeof documents)["\n  mutation CreateCompleterBlock($workspaceId: UUID!) {\n    createCompleterBlock(workspaceId: $workspaceId) {\n      id\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  mutation CreateBlockSet($presetId: UUID!) {\n    createBlockSet(presetId: $presetId) {\n      id\n    }\n  }\n"
): (typeof documents)["\n  mutation CreateBlockSet($presetId: UUID!) {\n    createBlockSet(presetId: $presetId) {\n      id\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  mutation UpdateSpaceMutation(\n    $workspaceId: UUID!\n    $name: String!\n  ) {\n    updateSpace(\n      id: $workspaceId\n      name: $name\n    ) {\n      id\n    }\n  }\n"
): (typeof documents)["\n  mutation UpdateSpaceMutation(\n    $workspaceId: UUID!\n    $name: String!\n  ) {\n    updateSpace(\n      id: $workspaceId\n      name: $name\n    ) {\n      id\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  mutation DeleteSpaceMutation($workspaceId: UUID!) {\n    deleteSpace(id: $workspaceId) {\n      isSuccess\n    }\n  }\n"
): (typeof documents)["\n  mutation DeleteSpaceMutation($workspaceId: UUID!) {\n    deleteSpace(id: $workspaceId) {\n      isSuccess\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  query SpaceV2Query($spaceId: UUID!) {\n    spaceV2(id: $spaceId) {\n      id\n      name\n      content\n    }\n  }\n"
): (typeof documents)["\n  query SpaceV2Query($spaceId: UUID!) {\n    spaceV2(id: $spaceId) {\n      id\n      name\n      content\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  mutation UpdateSpaceV2Mutation($spaceId: UUID!, $content: String!) {\n    updateSpaceV2(id: $spaceId, content: $content) {\n      id\n      name\n      content\n    }\n  }\n"
): (typeof documents)["\n  mutation UpdateSpaceV2Mutation($spaceId: UUID!, $content: String!) {\n    updateSpaceV2(id: $spaceId, content: $content) {\n      id\n      name\n      content\n    }\n  }\n"];

export function gql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> =
  TDocumentNode extends DocumentNode<infer TType, any> ? TType : never;
