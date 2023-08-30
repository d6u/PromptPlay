/* eslint-disable */
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string | number; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  /** Date with time (isoformat) */
  DateTime: { input: any; output: any; }
  UUID: { input: any; output: any; }
};

export type Block = {
  id: Scalars['UUID']['output'];
};

export type BlockSet = {
  __typename?: 'BlockSet';
  completerBlock?: Maybe<CompleterBlock>;
  id: Scalars['UUID']['output'];
  isInputIncludingPreviousBlockSetOutput: Scalars['Boolean']['output'];
  isOutputIncludingInputBlocks: Scalars['Boolean']['output'];
  isRepeatingCurrentBlockSet: Scalars['Boolean']['output'];
  position: Scalars['Int']['output'];
  previousBlockSetsInputBlocks: Array<PromptBlock>;
  systemPromptBlock?: Maybe<PromptBlock>;
  topInputPromptBlock?: Maybe<PromptBlock>;
  topOutputBlock?: Maybe<PromptBlock>;
};

export type CompleterBlock = Block & {
  __typename?: 'CompleterBlock';
  id: Scalars['UUID']['output'];
  model: Scalars['String']['output'];
  stop: Scalars['String']['output'];
  temperature: Scalars['Float']['output'];
};

export type CreateExampleWorkspaceResult = {
  __typename?: 'CreateExampleWorkspaceResult';
  isSuccess: Scalars['Boolean']['output'];
  placeholderClientToken?: Maybe<Scalars['UUID']['output']>;
  space?: Maybe<Workspace>;
};

export type CreatePlaceholderUserAndExampleSpaceResult = {
  __typename?: 'CreatePlaceholderUserAndExampleSpaceResult';
  placeholderClientToken: Scalars['ID']['output'];
  space: Space;
};

export type DeletionResult = {
  __typename?: 'DeletionResult';
  isSuccess: Scalars['Boolean']['output'];
};

export type Mutation = {
  __typename?: 'Mutation';
  addCompleterToBlockSet?: Maybe<BlockSet>;
  addPromptToBlockSetTopInput?: Maybe<BlockSet>;
  addPromptToBlockSetTopOutput?: Maybe<BlockSet>;
  addSystemPromptToBlockSet?: Maybe<BlockSet>;
  createBlockSet?: Maybe<BlockSet>;
  createCompleterBlock?: Maybe<CompleterBlock>;
  createExampleWorkspace?: Maybe<CreateExampleWorkspaceResult>;
  createPlaceholderUserAndExampleSpace: CreatePlaceholderUserAndExampleSpaceResult;
  createPromptBlock?: Maybe<PromptBlock>;
  createSpace?: Maybe<Space>;
  createTopOutputBlockOnBlockSet?: Maybe<BlockSet>;
  createWorkspace?: Maybe<Workspace>;
  deleteBlock?: Maybe<DeletionResult>;
  deleteBlockSet?: Maybe<DeletionResult>;
  deleteSpace?: Maybe<Scalars['Boolean']['output']>;
  deleteWorkspace?: Maybe<DeletionResult>;
  executeBlockSet?: Maybe<BlockSet>;
  mergePlaceholderUserWithLoggedInUser?: Maybe<Scalars['Boolean']['output']>;
  removeCompleterFromBlockSet?: Maybe<BlockSet>;
  removeSystemPromptFromBlockSet?: Maybe<BlockSet>;
  removeTopInputFromBlockSet?: Maybe<BlockSet>;
  removeTopOutputFromBlockSet?: Maybe<BlockSet>;
  swapBlockSetPositions?: Maybe<Preset>;
  updateBlockSetOptions?: Maybe<BlockSet>;
  updateCompleterBlock?: Maybe<CompleterBlock>;
  updatePromptBlock?: Maybe<PromptBlock>;
  updateSpace?: Maybe<Space>;
  updateWorkspace?: Maybe<Workspace>;
};


export type MutationAddCompleterToBlockSetArgs = {
  blockSetId: Scalars['UUID']['input'];
  completerBlockId: Scalars['UUID']['input'];
};


export type MutationAddPromptToBlockSetTopInputArgs = {
  blockSetId: Scalars['UUID']['input'];
  promptBlockId: Scalars['UUID']['input'];
};


export type MutationAddPromptToBlockSetTopOutputArgs = {
  blockSetId: Scalars['UUID']['input'];
  promptBlockId: Scalars['UUID']['input'];
};


export type MutationAddSystemPromptToBlockSetArgs = {
  blockSetId: Scalars['UUID']['input'];
  promptBlockId: Scalars['UUID']['input'];
};


export type MutationCreateBlockSetArgs = {
  presetId: Scalars['UUID']['input'];
};


export type MutationCreateCompleterBlockArgs = {
  workspaceId: Scalars['UUID']['input'];
};


export type MutationCreatePromptBlockArgs = {
  workspaceId: Scalars['UUID']['input'];
};


export type MutationCreateTopOutputBlockOnBlockSetArgs = {
  blockSetId: Scalars['UUID']['input'];
};


export type MutationDeleteBlockArgs = {
  blockId: Scalars['UUID']['input'];
};


export type MutationDeleteBlockSetArgs = {
  blockSetId: Scalars['UUID']['input'];
};


export type MutationDeleteSpaceArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteWorkspaceArgs = {
  id: Scalars['UUID']['input'];
};


export type MutationExecuteBlockSetArgs = {
  blockSetId: Scalars['UUID']['input'];
};


export type MutationMergePlaceholderUserWithLoggedInUserArgs = {
  placeholderUserToken: Scalars['String']['input'];
};


export type MutationRemoveCompleterFromBlockSetArgs = {
  blockSetId: Scalars['UUID']['input'];
};


export type MutationRemoveSystemPromptFromBlockSetArgs = {
  blockSetId: Scalars['UUID']['input'];
};


export type MutationRemoveTopInputFromBlockSetArgs = {
  blockSetId: Scalars['UUID']['input'];
};


export type MutationRemoveTopOutputFromBlockSetArgs = {
  blockSetId: Scalars['UUID']['input'];
};


export type MutationSwapBlockSetPositionsArgs = {
  movingBlockSetId: Scalars['UUID']['input'];
  slotBlockSetId: Scalars['UUID']['input'];
};


export type MutationUpdateBlockSetOptionsArgs = {
  blockSetId: Scalars['UUID']['input'];
  isInputIncludingPreviousBlockSetOutput: Scalars['Boolean']['input'];
  isOutputIncludingInputBlocks: Scalars['Boolean']['input'];
  isRepeatingCurrentBlockSet: Scalars['Boolean']['input'];
};


export type MutationUpdateCompleterBlockArgs = {
  id: Scalars['UUID']['input'];
  model: Scalars['String']['input'];
  stop: Scalars['String']['input'];
  temperature: Scalars['Float']['input'];
};


export type MutationUpdatePromptBlockArgs = {
  content: Scalars['String']['input'];
  id: Scalars['UUID']['input'];
  role: PromptType;
};


export type MutationUpdateSpaceArgs = {
  content?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
  name?: InputMaybe<Scalars['String']['input']>;
};


export type MutationUpdateWorkspaceArgs = {
  id: Scalars['UUID']['input'];
  name: Scalars['String']['input'];
};

export type Preset = {
  __typename?: 'Preset';
  blockSets: Array<BlockSet>;
  id: Scalars['UUID']['output'];
  name: Scalars['String']['output'];
};

export type PromptBlock = Block & {
  __typename?: 'PromptBlock';
  content: Scalars['String']['output'];
  id: Scalars['UUID']['output'];
  role: PromptType;
};

export enum PromptType {
  Assistant = 'Assistant',
  System = 'System',
  User = 'User'
}

export type Query = {
  __typename?: 'Query';
  hello: Scalars['String']['output'];
  /** Check if there is a user and the user is not a placeholder user */
  isLoggedIn: Scalars['Boolean']['output'];
  /** When PlaceholderUserToken header is present and the token is not mapped to a user */
  isPlaceholderUserTokenInvalid: Scalars['Boolean']['output'];
  preset?: Maybe<Preset>;
  space?: Maybe<QuerySpaceResult>;
  user?: Maybe<User>;
  workspace?: Maybe<Workspace>;
};


export type QueryPresetArgs = {
  presetId: Scalars['UUID']['input'];
};


export type QuerySpaceArgs = {
  id: Scalars['UUID']['input'];
};


export type QueryWorkspaceArgs = {
  workspaceId: Scalars['UUID']['input'];
};

export type QuerySpaceResult = {
  __typename?: 'QuerySpaceResult';
  isReadOnly: Scalars['Boolean']['output'];
  space: Space;
};

export type Space = {
  __typename?: 'Space';
  content?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type User = {
  __typename?: 'User';
  email?: Maybe<Scalars['String']['output']>;
  id: Scalars['UUID']['output'];
  profilePictureUrl?: Maybe<Scalars['String']['output']>;
  spaces: Array<Space>;
  workspaces: Array<Workspace>;
};

export type Workspace = {
  __typename?: 'Workspace';
  blocks: Array<Block>;
  firstPreset?: Maybe<Preset>;
  id: Scalars['UUID']['output'];
  name: Scalars['String']['output'];
  preset: Preset;
  presets: Array<Preset>;
  updatedAt: Scalars['DateTime']['output'];
};


export type WorkspacePresetArgs = {
  presetId: Scalars['UUID']['input'];
};

type DraggingBlock_CompleterBlock_Fragment = { __typename: 'CompleterBlock', model: string, temperature: number, stop: string, id: any } & { ' $fragmentName'?: 'DraggingBlock_CompleterBlock_Fragment' };

type DraggingBlock_PromptBlock_Fragment = { __typename: 'PromptBlock', role: PromptType, content: string, id: any } & { ' $fragmentName'?: 'DraggingBlock_PromptBlock_Fragment' };

export type DraggingBlockFragment = DraggingBlock_CompleterBlock_Fragment | DraggingBlock_PromptBlock_Fragment;

type LibraryBlock_CompleterBlock_Fragment = { __typename: 'CompleterBlock', model: string, temperature: number, stop: string, id: any } & { ' $fragmentName'?: 'LibraryBlock_CompleterBlock_Fragment' };

type LibraryBlock_PromptBlock_Fragment = { __typename: 'PromptBlock', role: PromptType, content: string, id: any } & { ' $fragmentName'?: 'LibraryBlock_PromptBlock_Fragment' };

export type LibraryBlockFragment = LibraryBlock_CompleterBlock_Fragment | LibraryBlock_PromptBlock_Fragment;

export type CreatePlaceholderUserAndExampleSpaceMutationMutationVariables = Exact<{ [key: string]: never; }>;


export type CreatePlaceholderUserAndExampleSpaceMutationMutation = { __typename?: 'Mutation', result: { __typename?: 'CreatePlaceholderUserAndExampleSpaceResult', placeholderClientToken: string, space: { __typename?: 'Space', id: string } } };

export type DashboardFragment = { __typename?: 'User', spaces: Array<{ __typename?: 'Space', id: string, name: string, updatedAt: any }> } & { ' $fragmentName'?: 'DashboardFragment' };

export type CreateSpaceMutationMutationVariables = Exact<{ [key: string]: never; }>;


export type CreateSpaceMutationMutation = { __typename?: 'Mutation', result?: { __typename?: 'Space', id: string, name: string, updatedAt: any } | null };

export type HeaderQueryQueryVariables = Exact<{ [key: string]: never; }>;


export type HeaderQueryQuery = { __typename?: 'Query', isLoggedIn: boolean, isPlaceholderUserTokenInvalid: boolean, user?: { __typename?: 'User', email?: string | null, profilePictureUrl?: string | null } | null };

export type MergePlaceholderUserWithLoggedInUserMutationMutationVariables = Exact<{
  placeholderUserToken: Scalars['String']['input'];
}>;


export type MergePlaceholderUserWithLoggedInUserMutationMutation = { __typename?: 'Mutation', result?: boolean | null };

export type RootRouteQueryQueryVariables = Exact<{ [key: string]: never; }>;


export type RootRouteQueryQuery = { __typename?: 'Query', user?: (
    { __typename?: 'User', id: any }
    & { ' $fragmentRefs'?: { 'DashboardFragment': DashboardFragment } }
  ) | null };

export type SpaceSubHeaderFragmentFragment = { __typename?: 'Space', name: string } & { ' $fragmentName'?: 'SpaceSubHeaderFragmentFragment' };

export type WorkspaceQueryFragment = (
  { __typename?: 'Query', workspace?: { __typename?: 'Workspace', firstPreset?: { __typename?: 'Preset', id: any, blockSets: Array<{ __typename?: 'BlockSet', id: any, position: number }> } | null } | null }
  & { ' $fragmentRefs'?: { 'WorkspaceContentFragment': WorkspaceContentFragment } }
) & { ' $fragmentName'?: 'WorkspaceQueryFragment' };

export type AddPromptToBlockSetTopInputMutationMutationVariables = Exact<{
  promptBlockId: Scalars['UUID']['input'];
  blockSetId: Scalars['UUID']['input'];
}>;


export type AddPromptToBlockSetTopInputMutationMutation = { __typename?: 'Mutation', addPromptToBlockSetTopInput?: { __typename?: 'BlockSet', id: any } | null };

export type AddCompleterToBlockSetMutationMutationVariables = Exact<{
  blockSetId: Scalars['UUID']['input'];
  completerBlockId: Scalars['UUID']['input'];
}>;


export type AddCompleterToBlockSetMutationMutation = { __typename?: 'Mutation', addCompleterToBlockSet?: { __typename?: 'BlockSet', id: any } | null };

export type AddSystemPromptToBlockSetMutationMutationVariables = Exact<{
  blockSetId: Scalars['UUID']['input'];
  promptBlockId: Scalars['UUID']['input'];
}>;


export type AddSystemPromptToBlockSetMutationMutation = { __typename?: 'Mutation', addSystemPromptToBlockSet?: { __typename?: 'BlockSet', id: any } | null };

export type AddPromptToBlockSetTopOutputMutationMutationVariables = Exact<{
  promptBlockId: Scalars['UUID']['input'];
  blockSetId: Scalars['UUID']['input'];
}>;


export type AddPromptToBlockSetTopOutputMutationMutation = { __typename?: 'Mutation', addPromptToBlockSetTopOutput?: { __typename?: 'BlockSet', id: any } | null };

export type SwapBlockSetPositionsMutationMutationVariables = Exact<{
  movingBlockSetId: Scalars['UUID']['input'];
  slotBlockSetId: Scalars['UUID']['input'];
}>;


export type SwapBlockSetPositionsMutationMutation = { __typename?: 'Mutation', swapBlockSetPositions?: { __typename?: 'Preset', id: any, blockSets: Array<{ __typename?: 'BlockSet', id: any, position: number }> } | null };

export type WorkspaceContentFragment = { __typename?: 'Query', workspace?: (
    { __typename?: 'Workspace', id: any, firstPreset?: (
      { __typename?: 'Preset', id: any }
      & { ' $fragmentRefs'?: { 'SimulatorFragment': SimulatorFragment } }
    ) | null }
    & { ' $fragmentRefs'?: { 'LibraryFragment': LibraryFragment } }
  ) | null } & { ' $fragmentName'?: 'WorkspaceContentFragment' };

export type WorkspaceRouteQueryQueryVariables = Exact<{
  workspaceId: Scalars['UUID']['input'];
}>;


export type WorkspaceRouteQueryQuery = (
  { __typename?: 'Query', user?: { __typename?: 'User', id: any } | null }
  & { ' $fragmentRefs'?: { 'SubHeaderFragmentFragment': SubHeaderFragmentFragment;'WorkspaceQueryFragment': WorkspaceQueryFragment } }
);

export type EditorBlockSetFragment = { __typename?: 'BlockSet', id: any, isInputIncludingPreviousBlockSetOutput: boolean, isOutputIncludingInputBlocks: boolean, isRepeatingCurrentBlockSet: boolean } & { ' $fragmentName'?: 'EditorBlockSetFragment' };

export type UpdateBlockSetOptionsMutationMutationVariables = Exact<{
  blockSetId: Scalars['UUID']['input'];
  isInputIncludingPreviousBlockSetOutput: Scalars['Boolean']['input'];
  isOutputIncludingInputBlocks: Scalars['Boolean']['input'];
  isRepeatingCurrentBlockSet: Scalars['Boolean']['input'];
}>;


export type UpdateBlockSetOptionsMutationMutation = { __typename?: 'Mutation', updateBlockSetOptions?: { __typename?: 'BlockSet', id: any } | null };

export type DeleteBlockSetMutationMutationVariables = Exact<{
  blockSetId: Scalars['UUID']['input'];
}>;


export type DeleteBlockSetMutationMutation = { __typename?: 'Mutation', deleteBlockSet?: { __typename?: 'DeletionResult', isSuccess: boolean } | null };

export type SelectedCompleterBlockFragment = { __typename?: 'CompleterBlock', id: any, model: string, temperature: number, stop: string } & { ' $fragmentName'?: 'SelectedCompleterBlockFragment' };

export type DeleteCompleterBlockMutationMutationVariables = Exact<{
  blockId: Scalars['UUID']['input'];
}>;


export type DeleteCompleterBlockMutationMutation = { __typename?: 'Mutation', deleteBlock?: { __typename?: 'DeletionResult', isSuccess: boolean } | null };

export type UpdateCompleterBlockMutationMutationVariables = Exact<{
  id: Scalars['UUID']['input'];
  model: Scalars['String']['input'];
  temperature: Scalars['Float']['input'];
  stop: Scalars['String']['input'];
}>;


export type UpdateCompleterBlockMutationMutation = { __typename?: 'Mutation', updateCompleterBlock?: { __typename?: 'CompleterBlock', id: any } | null };

export type SelectedBlockFragment = { __typename?: 'PromptBlock', id: any, role: PromptType, content: string } & { ' $fragmentName'?: 'SelectedBlockFragment' };

export type DeletePromptBlockMutationMutationVariables = Exact<{
  blockId: Scalars['UUID']['input'];
}>;


export type DeletePromptBlockMutationMutation = { __typename?: 'Mutation', deleteBlock?: { __typename?: 'DeletionResult', isSuccess: boolean } | null };

export type UpdateBlockMutationMutationVariables = Exact<{
  id: Scalars['UUID']['input'];
  role: PromptType;
  content: Scalars['String']['input'];
}>;


export type UpdateBlockMutationMutation = { __typename?: 'Mutation', updatePromptBlock?: { __typename?: 'PromptBlock', id: any } | null };

export type LibraryFragment = { __typename?: 'Workspace', blocks: Array<(
    { __typename: 'CompleterBlock', id: any }
    & { ' $fragmentRefs'?: { 'LibraryBlock_CompleterBlock_Fragment': LibraryBlock_CompleterBlock_Fragment } }
  ) | (
    { __typename: 'PromptBlock', id: any }
    & { ' $fragmentRefs'?: { 'LibraryBlock_PromptBlock_Fragment': LibraryBlock_PromptBlock_Fragment } }
  )> } & { ' $fragmentName'?: 'LibraryFragment' };

export type SimulatorBlockSetFragment = { __typename?: 'BlockSet', id: any, position: number, isInputIncludingPreviousBlockSetOutput: boolean, isOutputIncludingInputBlocks: boolean, isRepeatingCurrentBlockSet: boolean, topInputPromptBlock?: (
    { __typename?: 'PromptBlock', id: any }
    & { ' $fragmentRefs'?: { 'SimulatorBlock_PromptBlock_Fragment': SimulatorBlock_PromptBlock_Fragment } }
  ) | null, systemPromptBlock?: (
    { __typename?: 'PromptBlock', id: any }
    & { ' $fragmentRefs'?: { 'SimulatorBlock_PromptBlock_Fragment': SimulatorBlock_PromptBlock_Fragment } }
  ) | null, completerBlock?: (
    { __typename?: 'CompleterBlock', id: any }
    & { ' $fragmentRefs'?: { 'SimulatorBlock_CompleterBlock_Fragment': SimulatorBlock_CompleterBlock_Fragment } }
  ) | null, topOutputBlock?: (
    { __typename?: 'PromptBlock', id: any }
    & { ' $fragmentRefs'?: { 'SimulatorBlock_PromptBlock_Fragment': SimulatorBlock_PromptBlock_Fragment } }
  ) | null, previousBlockSetsInputBlocks: Array<(
    { __typename?: 'PromptBlock', id: any, role: PromptType }
    & { ' $fragmentRefs'?: { 'SimulatorBlock_PromptBlock_Fragment': SimulatorBlock_PromptBlock_Fragment } }
  )> } & { ' $fragmentName'?: 'SimulatorBlockSetFragment' };

export type RemoveTopInputFromBlockSetMutationMutationVariables = Exact<{
  blockSetId: Scalars['UUID']['input'];
}>;


export type RemoveTopInputFromBlockSetMutationMutation = { __typename?: 'Mutation', removeTopInputFromBlockSet?: { __typename?: 'BlockSet', id: any } | null };

export type RemoveSystemPromptFromBlockSetMutationMutationVariables = Exact<{
  blockSetId: Scalars['UUID']['input'];
}>;


export type RemoveSystemPromptFromBlockSetMutationMutation = { __typename?: 'Mutation', removeSystemPromptFromBlockSet?: { __typename?: 'BlockSet', id: any } | null };

export type RemoveCompleterFromBlockSetMutationMutationVariables = Exact<{
  blockSetId: Scalars['UUID']['input'];
}>;


export type RemoveCompleterFromBlockSetMutationMutation = { __typename?: 'Mutation', removeCompleterFromBlockSet?: { __typename?: 'BlockSet', id: any } | null };

export type RemoveTopOutputFromBlockSetMutationMutationVariables = Exact<{
  blockSetId: Scalars['UUID']['input'];
}>;


export type RemoveTopOutputFromBlockSetMutationMutation = { __typename?: 'Mutation', removeTopOutputFromBlockSet?: { __typename?: 'BlockSet', id: any } | null };

export type SimulatorFragment = { __typename?: 'Preset', id: any, blockSets: Array<(
    { __typename?: 'BlockSet', id: any }
    & { ' $fragmentRefs'?: { 'SimulatorBlockSetFragment': SimulatorBlockSetFragment } }
  )> } & { ' $fragmentName'?: 'SimulatorFragment' };

type SimulatorBlock_CompleterBlock_Fragment = { __typename: 'CompleterBlock', model: string, temperature: number, stop: string, id: any } & { ' $fragmentName'?: 'SimulatorBlock_CompleterBlock_Fragment' };

type SimulatorBlock_PromptBlock_Fragment = { __typename: 'PromptBlock', role: PromptType, content: string, id: any } & { ' $fragmentName'?: 'SimulatorBlock_PromptBlock_Fragment' };

export type SimulatorBlockFragment = SimulatorBlock_CompleterBlock_Fragment | SimulatorBlock_PromptBlock_Fragment;

export type RunButtonFragmentFragment = { __typename?: 'Preset', blockSets: Array<{ __typename?: 'BlockSet', id: any, topInputPromptBlock?: { __typename?: 'PromptBlock', id: any, role: PromptType, content: string } | null, systemPromptBlock?: { __typename?: 'PromptBlock', id: any, content: string } | null, completerBlock?: { __typename?: 'CompleterBlock', id: any, model: string, temperature: number, stop: string } | null }> } & { ' $fragmentName'?: 'RunButtonFragmentFragment' };

export type SubHeaderBlockSetFragmentFragment = { __typename?: 'BlockSet', id: any, position: number, isInputIncludingPreviousBlockSetOutput: boolean, isOutputIncludingInputBlocks: boolean, isRepeatingCurrentBlockSet: boolean, topInputPromptBlock?: { __typename?: 'PromptBlock', id: any, role: PromptType, content: string } | null, systemPromptBlock?: { __typename?: 'PromptBlock', id: any, content: string } | null, completerBlock?: { __typename?: 'CompleterBlock', id: any, model: string, temperature: number, stop: string } | null, topOutputBlock?: { __typename?: 'PromptBlock', id: any, content: string } | null, previousBlockSetsInputBlocks: Array<{ __typename?: 'PromptBlock', id: any, role: PromptType, content: string }> } & { ' $fragmentName'?: 'SubHeaderBlockSetFragmentFragment' };

export type CreateTopOutputBlockOnBlockSetMutationMutationVariables = Exact<{
  blockSetId: Scalars['UUID']['input'];
}>;


export type CreateTopOutputBlockOnBlockSetMutationMutation = { __typename?: 'Mutation', createTopOutputBlockOnBlockSet?: { __typename?: 'BlockSet', id: any, topOutputBlock?: { __typename?: 'PromptBlock', id: any } | null } | null };

export type UpdatePromptBlockMutationMutationVariables = Exact<{
  id: Scalars['UUID']['input'];
  content: Scalars['String']['input'];
}>;


export type UpdatePromptBlockMutationMutation = { __typename?: 'Mutation', updatePromptBlock?: { __typename?: 'PromptBlock', id: any } | null };

export type SubHeaderFragmentFragment = { __typename?: 'Query', workspace?: { __typename?: 'Workspace', name: string, firstPreset?: (
      { __typename?: 'Preset', id: any }
      & { ' $fragmentRefs'?: { 'RunButtonFragmentFragment': RunButtonFragmentFragment } }
    ) | null } | null } & { ' $fragmentName'?: 'SubHeaderFragmentFragment' };

export type CreatePromptBlockMutationMutationVariables = Exact<{
  workspaceId: Scalars['UUID']['input'];
}>;


export type CreatePromptBlockMutationMutation = { __typename?: 'Mutation', createPromptBlock?: { __typename?: 'PromptBlock', id: any } | null };

export type CreateCompleterBlockMutationVariables = Exact<{
  workspaceId: Scalars['UUID']['input'];
}>;


export type CreateCompleterBlockMutation = { __typename?: 'Mutation', createCompleterBlock?: { __typename?: 'CompleterBlock', id: any } | null };

export type CreateBlockSetMutationVariables = Exact<{
  presetId: Scalars['UUID']['input'];
}>;


export type CreateBlockSetMutation = { __typename?: 'Mutation', createBlockSet?: { __typename?: 'BlockSet', id: any } | null };

export type UpdateWorkspaceMutationMutationVariables = Exact<{
  workspaceId: Scalars['UUID']['input'];
  name: Scalars['String']['input'];
}>;


export type UpdateWorkspaceMutationMutation = { __typename?: 'Mutation', updateWorkspace?: { __typename?: 'Workspace', id: any } | null };

export type DeleteWorkspaceMutationMutationVariables = Exact<{
  workspaceId: Scalars['UUID']['input'];
}>;


export type DeleteWorkspaceMutationMutation = { __typename?: 'Mutation', deleteWorkspace?: { __typename?: 'DeletionResult', isSuccess: boolean } | null };

export type SpaceQueryQueryVariables = Exact<{
  spaceId: Scalars['UUID']['input'];
}>;


export type SpaceQueryQuery = { __typename?: 'Query', result?: { __typename?: 'QuerySpaceResult', isReadOnly: boolean, space: (
      { __typename?: 'Space', id: string, name: string, content?: string | null }
      & { ' $fragmentRefs'?: { 'SpaceSubHeaderFragmentFragment': SpaceSubHeaderFragmentFragment } }
    ) } | null };

export type UpdateSpaceContentMutationMutationVariables = Exact<{
  spaceId: Scalars['ID']['input'];
  content: Scalars['String']['input'];
}>;


export type UpdateSpaceContentMutationMutation = { __typename?: 'Mutation', updateSpace?: { __typename?: 'Space', id: string, name: string, content?: string | null } | null };

export type UpdateSpaceNameMutationMutationVariables = Exact<{
  spaceId: Scalars['ID']['input'];
  name: Scalars['String']['input'];
}>;


export type UpdateSpaceNameMutationMutation = { __typename?: 'Mutation', updateSpace?: { __typename?: 'Space', id: string, name: string, content?: string | null } | null };

export type DeleteSpaceMutationMutationVariables = Exact<{
  spaceId: Scalars['ID']['input'];
}>;


export type DeleteSpaceMutationMutation = { __typename?: 'Mutation', result?: boolean | null };

export const DraggingBlockFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"DraggingBlock"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Block"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PromptBlock"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"content"}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CompleterBlock"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"model"}},{"kind":"Field","name":{"kind":"Name","value":"temperature"}},{"kind":"Field","name":{"kind":"Name","value":"stop"}}]}}]}}]} as unknown as DocumentNode<DraggingBlockFragment, unknown>;
export const DashboardFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"Dashboard"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"User"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"spaces"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<DashboardFragment, unknown>;
export const SpaceSubHeaderFragmentFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SpaceSubHeaderFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Space"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]} as unknown as DocumentNode<SpaceSubHeaderFragmentFragment, unknown>;
export const LibraryBlockFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"LibraryBlock"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Block"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PromptBlock"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"content"}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CompleterBlock"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"model"}},{"kind":"Field","name":{"kind":"Name","value":"temperature"}},{"kind":"Field","name":{"kind":"Name","value":"stop"}}]}}]}}]} as unknown as DocumentNode<LibraryBlockFragment, unknown>;
export const LibraryFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"Library"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Workspace"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"blocks"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"FragmentSpread","name":{"kind":"Name","value":"LibraryBlock"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"LibraryBlock"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Block"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PromptBlock"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"content"}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CompleterBlock"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"model"}},{"kind":"Field","name":{"kind":"Name","value":"temperature"}},{"kind":"Field","name":{"kind":"Name","value":"stop"}}]}}]}}]} as unknown as DocumentNode<LibraryFragment, unknown>;
export const SimulatorBlockFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SimulatorBlock"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Block"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PromptBlock"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"content"}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CompleterBlock"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"model"}},{"kind":"Field","name":{"kind":"Name","value":"temperature"}},{"kind":"Field","name":{"kind":"Name","value":"stop"}}]}}]}}]} as unknown as DocumentNode<SimulatorBlockFragment, unknown>;
export const SimulatorBlockSetFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SimulatorBlockSet"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"BlockSet"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"position"}},{"kind":"Field","name":{"kind":"Name","value":"isInputIncludingPreviousBlockSetOutput"}},{"kind":"Field","name":{"kind":"Name","value":"isOutputIncludingInputBlocks"}},{"kind":"Field","name":{"kind":"Name","value":"isRepeatingCurrentBlockSet"}},{"kind":"Field","name":{"kind":"Name","value":"topInputPromptBlock"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"FragmentSpread","name":{"kind":"Name","value":"SimulatorBlock"}}]}},{"kind":"Field","name":{"kind":"Name","value":"systemPromptBlock"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"FragmentSpread","name":{"kind":"Name","value":"SimulatorBlock"}}]}},{"kind":"Field","name":{"kind":"Name","value":"completerBlock"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"FragmentSpread","name":{"kind":"Name","value":"SimulatorBlock"}}]}},{"kind":"Field","name":{"kind":"Name","value":"topOutputBlock"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"FragmentSpread","name":{"kind":"Name","value":"SimulatorBlock"}}]}},{"kind":"Field","name":{"kind":"Name","value":"previousBlockSetsInputBlocks"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"FragmentSpread","name":{"kind":"Name","value":"SimulatorBlock"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SimulatorBlock"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Block"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PromptBlock"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"content"}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CompleterBlock"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"model"}},{"kind":"Field","name":{"kind":"Name","value":"temperature"}},{"kind":"Field","name":{"kind":"Name","value":"stop"}}]}}]}}]} as unknown as DocumentNode<SimulatorBlockSetFragment, unknown>;
export const SimulatorFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"Simulator"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Preset"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"blockSets"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"FragmentSpread","name":{"kind":"Name","value":"SimulatorBlockSet"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SimulatorBlock"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Block"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PromptBlock"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"content"}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CompleterBlock"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"model"}},{"kind":"Field","name":{"kind":"Name","value":"temperature"}},{"kind":"Field","name":{"kind":"Name","value":"stop"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SimulatorBlockSet"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"BlockSet"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"position"}},{"kind":"Field","name":{"kind":"Name","value":"isInputIncludingPreviousBlockSetOutput"}},{"kind":"Field","name":{"kind":"Name","value":"isOutputIncludingInputBlocks"}},{"kind":"Field","name":{"kind":"Name","value":"isRepeatingCurrentBlockSet"}},{"kind":"Field","name":{"kind":"Name","value":"topInputPromptBlock"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"FragmentSpread","name":{"kind":"Name","value":"SimulatorBlock"}}]}},{"kind":"Field","name":{"kind":"Name","value":"systemPromptBlock"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"FragmentSpread","name":{"kind":"Name","value":"SimulatorBlock"}}]}},{"kind":"Field","name":{"kind":"Name","value":"completerBlock"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"FragmentSpread","name":{"kind":"Name","value":"SimulatorBlock"}}]}},{"kind":"Field","name":{"kind":"Name","value":"topOutputBlock"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"FragmentSpread","name":{"kind":"Name","value":"SimulatorBlock"}}]}},{"kind":"Field","name":{"kind":"Name","value":"previousBlockSetsInputBlocks"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"FragmentSpread","name":{"kind":"Name","value":"SimulatorBlock"}}]}}]}}]} as unknown as DocumentNode<SimulatorFragment, unknown>;
export const WorkspaceContentFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"WorkspaceContent"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Query"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"workspace"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"workspaceId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"workspaceId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"FragmentSpread","name":{"kind":"Name","value":"Library"}},{"kind":"Field","name":{"kind":"Name","value":"firstPreset"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"FragmentSpread","name":{"kind":"Name","value":"Simulator"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"LibraryBlock"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Block"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PromptBlock"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"content"}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CompleterBlock"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"model"}},{"kind":"Field","name":{"kind":"Name","value":"temperature"}},{"kind":"Field","name":{"kind":"Name","value":"stop"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SimulatorBlock"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Block"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PromptBlock"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"content"}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CompleterBlock"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"model"}},{"kind":"Field","name":{"kind":"Name","value":"temperature"}},{"kind":"Field","name":{"kind":"Name","value":"stop"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SimulatorBlockSet"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"BlockSet"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"position"}},{"kind":"Field","name":{"kind":"Name","value":"isInputIncludingPreviousBlockSetOutput"}},{"kind":"Field","name":{"kind":"Name","value":"isOutputIncludingInputBlocks"}},{"kind":"Field","name":{"kind":"Name","value":"isRepeatingCurrentBlockSet"}},{"kind":"Field","name":{"kind":"Name","value":"topInputPromptBlock"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"FragmentSpread","name":{"kind":"Name","value":"SimulatorBlock"}}]}},{"kind":"Field","name":{"kind":"Name","value":"systemPromptBlock"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"FragmentSpread","name":{"kind":"Name","value":"SimulatorBlock"}}]}},{"kind":"Field","name":{"kind":"Name","value":"completerBlock"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"FragmentSpread","name":{"kind":"Name","value":"SimulatorBlock"}}]}},{"kind":"Field","name":{"kind":"Name","value":"topOutputBlock"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"FragmentSpread","name":{"kind":"Name","value":"SimulatorBlock"}}]}},{"kind":"Field","name":{"kind":"Name","value":"previousBlockSetsInputBlocks"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"FragmentSpread","name":{"kind":"Name","value":"SimulatorBlock"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"Library"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Workspace"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"blocks"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"FragmentSpread","name":{"kind":"Name","value":"LibraryBlock"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"Simulator"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Preset"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"blockSets"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"FragmentSpread","name":{"kind":"Name","value":"SimulatorBlockSet"}}]}}]}}]} as unknown as DocumentNode<WorkspaceContentFragment, unknown>;
export const WorkspaceQueryFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"WorkspaceQuery"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Query"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"workspace"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"workspaceId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"workspaceId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"firstPreset"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"blockSets"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"position"}}]}}]}}]}},{"kind":"FragmentSpread","name":{"kind":"Name","value":"WorkspaceContent"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"LibraryBlock"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Block"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PromptBlock"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"content"}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CompleterBlock"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"model"}},{"kind":"Field","name":{"kind":"Name","value":"temperature"}},{"kind":"Field","name":{"kind":"Name","value":"stop"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"Library"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Workspace"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"blocks"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"FragmentSpread","name":{"kind":"Name","value":"LibraryBlock"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SimulatorBlock"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Block"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PromptBlock"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"content"}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CompleterBlock"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"model"}},{"kind":"Field","name":{"kind":"Name","value":"temperature"}},{"kind":"Field","name":{"kind":"Name","value":"stop"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SimulatorBlockSet"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"BlockSet"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"position"}},{"kind":"Field","name":{"kind":"Name","value":"isInputIncludingPreviousBlockSetOutput"}},{"kind":"Field","name":{"kind":"Name","value":"isOutputIncludingInputBlocks"}},{"kind":"Field","name":{"kind":"Name","value":"isRepeatingCurrentBlockSet"}},{"kind":"Field","name":{"kind":"Name","value":"topInputPromptBlock"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"FragmentSpread","name":{"kind":"Name","value":"SimulatorBlock"}}]}},{"kind":"Field","name":{"kind":"Name","value":"systemPromptBlock"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"FragmentSpread","name":{"kind":"Name","value":"SimulatorBlock"}}]}},{"kind":"Field","name":{"kind":"Name","value":"completerBlock"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"FragmentSpread","name":{"kind":"Name","value":"SimulatorBlock"}}]}},{"kind":"Field","name":{"kind":"Name","value":"topOutputBlock"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"FragmentSpread","name":{"kind":"Name","value":"SimulatorBlock"}}]}},{"kind":"Field","name":{"kind":"Name","value":"previousBlockSetsInputBlocks"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"FragmentSpread","name":{"kind":"Name","value":"SimulatorBlock"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"Simulator"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Preset"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"blockSets"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"FragmentSpread","name":{"kind":"Name","value":"SimulatorBlockSet"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"WorkspaceContent"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Query"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"workspace"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"workspaceId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"workspaceId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"FragmentSpread","name":{"kind":"Name","value":"Library"}},{"kind":"Field","name":{"kind":"Name","value":"firstPreset"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"FragmentSpread","name":{"kind":"Name","value":"Simulator"}}]}}]}}]}}]} as unknown as DocumentNode<WorkspaceQueryFragment, unknown>;
export const EditorBlockSetFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"EditorBlockSet"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"BlockSet"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"isInputIncludingPreviousBlockSetOutput"}},{"kind":"Field","name":{"kind":"Name","value":"isOutputIncludingInputBlocks"}},{"kind":"Field","name":{"kind":"Name","value":"isRepeatingCurrentBlockSet"}}]}}]} as unknown as DocumentNode<EditorBlockSetFragment, unknown>;
export const SelectedCompleterBlockFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SelectedCompleterBlock"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CompleterBlock"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"model"}},{"kind":"Field","name":{"kind":"Name","value":"temperature"}},{"kind":"Field","name":{"kind":"Name","value":"stop"}}]}}]} as unknown as DocumentNode<SelectedCompleterBlockFragment, unknown>;
export const SelectedBlockFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SelectedBlock"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PromptBlock"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"content"}}]}}]} as unknown as DocumentNode<SelectedBlockFragment, unknown>;
export const SubHeaderBlockSetFragmentFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SubHeaderBlockSetFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"BlockSet"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"position"}},{"kind":"Field","name":{"kind":"Name","value":"isInputIncludingPreviousBlockSetOutput"}},{"kind":"Field","name":{"kind":"Name","value":"isOutputIncludingInputBlocks"}},{"kind":"Field","name":{"kind":"Name","value":"isRepeatingCurrentBlockSet"}},{"kind":"Field","name":{"kind":"Name","value":"topInputPromptBlock"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"content"}}]}},{"kind":"Field","name":{"kind":"Name","value":"systemPromptBlock"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"content"}}]}},{"kind":"Field","name":{"kind":"Name","value":"completerBlock"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"model"}},{"kind":"Field","name":{"kind":"Name","value":"temperature"}},{"kind":"Field","name":{"kind":"Name","value":"stop"}}]}},{"kind":"Field","name":{"kind":"Name","value":"topOutputBlock"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"content"}}]}},{"kind":"Field","name":{"kind":"Name","value":"previousBlockSetsInputBlocks"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"content"}}]}}]}}]} as unknown as DocumentNode<SubHeaderBlockSetFragmentFragment, unknown>;
export const RunButtonFragmentFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"RunButtonFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Preset"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"blockSets"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"topInputPromptBlock"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"content"}}]}},{"kind":"Field","name":{"kind":"Name","value":"systemPromptBlock"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"content"}}]}},{"kind":"Field","name":{"kind":"Name","value":"completerBlock"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"model"}},{"kind":"Field","name":{"kind":"Name","value":"temperature"}},{"kind":"Field","name":{"kind":"Name","value":"stop"}}]}}]}}]}}]} as unknown as DocumentNode<RunButtonFragmentFragment, unknown>;
export const SubHeaderFragmentFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SubHeaderFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Query"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"workspace"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"workspaceId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"workspaceId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"firstPreset"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"FragmentSpread","name":{"kind":"Name","value":"RunButtonFragment"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"RunButtonFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Preset"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"blockSets"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"topInputPromptBlock"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"content"}}]}},{"kind":"Field","name":{"kind":"Name","value":"systemPromptBlock"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"content"}}]}},{"kind":"Field","name":{"kind":"Name","value":"completerBlock"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"model"}},{"kind":"Field","name":{"kind":"Name","value":"temperature"}},{"kind":"Field","name":{"kind":"Name","value":"stop"}}]}}]}}]}}]} as unknown as DocumentNode<SubHeaderFragmentFragment, unknown>;
export const CreatePlaceholderUserAndExampleSpaceMutationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreatePlaceholderUserAndExampleSpaceMutation"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","alias":{"kind":"Name","value":"result"},"name":{"kind":"Name","value":"createPlaceholderUserAndExampleSpace"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"placeholderClientToken"}},{"kind":"Field","name":{"kind":"Name","value":"space"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]}}]} as unknown as DocumentNode<CreatePlaceholderUserAndExampleSpaceMutationMutation, CreatePlaceholderUserAndExampleSpaceMutationMutationVariables>;
export const CreateSpaceMutationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateSpaceMutation"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","alias":{"kind":"Name","value":"result"},"name":{"kind":"Name","value":"createSpace"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<CreateSpaceMutationMutation, CreateSpaceMutationMutationVariables>;
export const HeaderQueryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"HeaderQuery"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"isLoggedIn"}},{"kind":"Field","name":{"kind":"Name","value":"isPlaceholderUserTokenInvalid"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"profilePictureUrl"}}]}}]}}]} as unknown as DocumentNode<HeaderQueryQuery, HeaderQueryQueryVariables>;
export const MergePlaceholderUserWithLoggedInUserMutationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"MergePlaceholderUserWithLoggedInUserMutation"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"placeholderUserToken"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","alias":{"kind":"Name","value":"result"},"name":{"kind":"Name","value":"mergePlaceholderUserWithLoggedInUser"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"placeholderUserToken"},"value":{"kind":"Variable","name":{"kind":"Name","value":"placeholderUserToken"}}}]}]}}]} as unknown as DocumentNode<MergePlaceholderUserWithLoggedInUserMutationMutation, MergePlaceholderUserWithLoggedInUserMutationMutationVariables>;
export const RootRouteQueryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"RootRouteQuery"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"FragmentSpread","name":{"kind":"Name","value":"Dashboard"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"Dashboard"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"User"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"spaces"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<RootRouteQueryQuery, RootRouteQueryQueryVariables>;
export const AddPromptToBlockSetTopInputMutationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AddPromptToBlockSetTopInputMutation"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"promptBlockId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UUID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"blockSetId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UUID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"addPromptToBlockSetTopInput"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"promptBlockId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"promptBlockId"}}},{"kind":"Argument","name":{"kind":"Name","value":"blockSetId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"blockSetId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<AddPromptToBlockSetTopInputMutationMutation, AddPromptToBlockSetTopInputMutationMutationVariables>;
export const AddCompleterToBlockSetMutationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AddCompleterToBlockSetMutation"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"blockSetId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UUID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"completerBlockId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UUID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"addCompleterToBlockSet"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"blockSetId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"blockSetId"}}},{"kind":"Argument","name":{"kind":"Name","value":"completerBlockId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"completerBlockId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<AddCompleterToBlockSetMutationMutation, AddCompleterToBlockSetMutationMutationVariables>;
export const AddSystemPromptToBlockSetMutationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AddSystemPromptToBlockSetMutation"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"blockSetId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UUID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"promptBlockId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UUID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"addSystemPromptToBlockSet"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"blockSetId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"blockSetId"}}},{"kind":"Argument","name":{"kind":"Name","value":"promptBlockId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"promptBlockId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<AddSystemPromptToBlockSetMutationMutation, AddSystemPromptToBlockSetMutationMutationVariables>;
export const AddPromptToBlockSetTopOutputMutationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AddPromptToBlockSetTopOutputMutation"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"promptBlockId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UUID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"blockSetId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UUID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"addPromptToBlockSetTopOutput"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"promptBlockId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"promptBlockId"}}},{"kind":"Argument","name":{"kind":"Name","value":"blockSetId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"blockSetId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<AddPromptToBlockSetTopOutputMutationMutation, AddPromptToBlockSetTopOutputMutationMutationVariables>;
export const SwapBlockSetPositionsMutationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SwapBlockSetPositionsMutation"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"movingBlockSetId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UUID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"slotBlockSetId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UUID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"swapBlockSetPositions"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"movingBlockSetId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"movingBlockSetId"}}},{"kind":"Argument","name":{"kind":"Name","value":"slotBlockSetId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"slotBlockSetId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"blockSets"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"position"}}]}}]}}]}}]} as unknown as DocumentNode<SwapBlockSetPositionsMutationMutation, SwapBlockSetPositionsMutationMutationVariables>;
export const WorkspaceRouteQueryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"WorkspaceRouteQuery"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"workspaceId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UUID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}},{"kind":"FragmentSpread","name":{"kind":"Name","value":"SubHeaderFragment"}},{"kind":"FragmentSpread","name":{"kind":"Name","value":"WorkspaceQuery"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"RunButtonFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Preset"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"blockSets"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"topInputPromptBlock"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"content"}}]}},{"kind":"Field","name":{"kind":"Name","value":"systemPromptBlock"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"content"}}]}},{"kind":"Field","name":{"kind":"Name","value":"completerBlock"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"model"}},{"kind":"Field","name":{"kind":"Name","value":"temperature"}},{"kind":"Field","name":{"kind":"Name","value":"stop"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"LibraryBlock"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Block"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PromptBlock"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"content"}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CompleterBlock"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"model"}},{"kind":"Field","name":{"kind":"Name","value":"temperature"}},{"kind":"Field","name":{"kind":"Name","value":"stop"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"Library"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Workspace"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"blocks"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"FragmentSpread","name":{"kind":"Name","value":"LibraryBlock"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SimulatorBlock"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Block"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PromptBlock"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"content"}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CompleterBlock"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"model"}},{"kind":"Field","name":{"kind":"Name","value":"temperature"}},{"kind":"Field","name":{"kind":"Name","value":"stop"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SimulatorBlockSet"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"BlockSet"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"position"}},{"kind":"Field","name":{"kind":"Name","value":"isInputIncludingPreviousBlockSetOutput"}},{"kind":"Field","name":{"kind":"Name","value":"isOutputIncludingInputBlocks"}},{"kind":"Field","name":{"kind":"Name","value":"isRepeatingCurrentBlockSet"}},{"kind":"Field","name":{"kind":"Name","value":"topInputPromptBlock"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"FragmentSpread","name":{"kind":"Name","value":"SimulatorBlock"}}]}},{"kind":"Field","name":{"kind":"Name","value":"systemPromptBlock"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"FragmentSpread","name":{"kind":"Name","value":"SimulatorBlock"}}]}},{"kind":"Field","name":{"kind":"Name","value":"completerBlock"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"FragmentSpread","name":{"kind":"Name","value":"SimulatorBlock"}}]}},{"kind":"Field","name":{"kind":"Name","value":"topOutputBlock"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"FragmentSpread","name":{"kind":"Name","value":"SimulatorBlock"}}]}},{"kind":"Field","name":{"kind":"Name","value":"previousBlockSetsInputBlocks"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"FragmentSpread","name":{"kind":"Name","value":"SimulatorBlock"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"Simulator"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Preset"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"blockSets"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"FragmentSpread","name":{"kind":"Name","value":"SimulatorBlockSet"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"WorkspaceContent"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Query"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"workspace"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"workspaceId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"workspaceId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"FragmentSpread","name":{"kind":"Name","value":"Library"}},{"kind":"Field","name":{"kind":"Name","value":"firstPreset"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"FragmentSpread","name":{"kind":"Name","value":"Simulator"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SubHeaderFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Query"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"workspace"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"workspaceId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"workspaceId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"firstPreset"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"FragmentSpread","name":{"kind":"Name","value":"RunButtonFragment"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"WorkspaceQuery"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Query"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"workspace"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"workspaceId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"workspaceId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"firstPreset"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"blockSets"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"position"}}]}}]}}]}},{"kind":"FragmentSpread","name":{"kind":"Name","value":"WorkspaceContent"}}]}}]} as unknown as DocumentNode<WorkspaceRouteQueryQuery, WorkspaceRouteQueryQueryVariables>;
export const UpdateBlockSetOptionsMutationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateBlockSetOptionsMutation"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"blockSetId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UUID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"isInputIncludingPreviousBlockSetOutput"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"isOutputIncludingInputBlocks"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"isRepeatingCurrentBlockSet"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateBlockSetOptions"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"blockSetId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"blockSetId"}}},{"kind":"Argument","name":{"kind":"Name","value":"isInputIncludingPreviousBlockSetOutput"},"value":{"kind":"Variable","name":{"kind":"Name","value":"isInputIncludingPreviousBlockSetOutput"}}},{"kind":"Argument","name":{"kind":"Name","value":"isOutputIncludingInputBlocks"},"value":{"kind":"Variable","name":{"kind":"Name","value":"isOutputIncludingInputBlocks"}}},{"kind":"Argument","name":{"kind":"Name","value":"isRepeatingCurrentBlockSet"},"value":{"kind":"Variable","name":{"kind":"Name","value":"isRepeatingCurrentBlockSet"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<UpdateBlockSetOptionsMutationMutation, UpdateBlockSetOptionsMutationMutationVariables>;
export const DeleteBlockSetMutationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteBlockSetMutation"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"blockSetId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UUID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteBlockSet"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"blockSetId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"blockSetId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"isSuccess"}}]}}]}}]} as unknown as DocumentNode<DeleteBlockSetMutationMutation, DeleteBlockSetMutationMutationVariables>;
export const DeleteCompleterBlockMutationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteCompleterBlockMutation"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"blockId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UUID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteBlock"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"blockId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"blockId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"isSuccess"}}]}}]}}]} as unknown as DocumentNode<DeleteCompleterBlockMutationMutation, DeleteCompleterBlockMutationMutationVariables>;
export const UpdateCompleterBlockMutationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateCompleterBlockMutation"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UUID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"model"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"temperature"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Float"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"stop"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateCompleterBlock"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"model"},"value":{"kind":"Variable","name":{"kind":"Name","value":"model"}}},{"kind":"Argument","name":{"kind":"Name","value":"temperature"},"value":{"kind":"Variable","name":{"kind":"Name","value":"temperature"}}},{"kind":"Argument","name":{"kind":"Name","value":"stop"},"value":{"kind":"Variable","name":{"kind":"Name","value":"stop"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<UpdateCompleterBlockMutationMutation, UpdateCompleterBlockMutationMutationVariables>;
export const DeletePromptBlockMutationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeletePromptBlockMutation"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"blockId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UUID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteBlock"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"blockId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"blockId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"isSuccess"}}]}}]}}]} as unknown as DocumentNode<DeletePromptBlockMutationMutation, DeletePromptBlockMutationMutationVariables>;
export const UpdateBlockMutationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateBlockMutation"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UUID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"role"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"PromptType"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"content"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updatePromptBlock"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"role"},"value":{"kind":"Variable","name":{"kind":"Name","value":"role"}}},{"kind":"Argument","name":{"kind":"Name","value":"content"},"value":{"kind":"Variable","name":{"kind":"Name","value":"content"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<UpdateBlockMutationMutation, UpdateBlockMutationMutationVariables>;
export const RemoveTopInputFromBlockSetMutationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RemoveTopInputFromBlockSetMutation"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"blockSetId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UUID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"removeTopInputFromBlockSet"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"blockSetId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"blockSetId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<RemoveTopInputFromBlockSetMutationMutation, RemoveTopInputFromBlockSetMutationMutationVariables>;
export const RemoveSystemPromptFromBlockSetMutationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RemoveSystemPromptFromBlockSetMutation"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"blockSetId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UUID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"removeSystemPromptFromBlockSet"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"blockSetId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"blockSetId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<RemoveSystemPromptFromBlockSetMutationMutation, RemoveSystemPromptFromBlockSetMutationMutationVariables>;
export const RemoveCompleterFromBlockSetMutationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RemoveCompleterFromBlockSetMutation"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"blockSetId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UUID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"removeCompleterFromBlockSet"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"blockSetId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"blockSetId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<RemoveCompleterFromBlockSetMutationMutation, RemoveCompleterFromBlockSetMutationMutationVariables>;
export const RemoveTopOutputFromBlockSetMutationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RemoveTopOutputFromBlockSetMutation"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"blockSetId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UUID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"removeTopOutputFromBlockSet"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"blockSetId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"blockSetId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<RemoveTopOutputFromBlockSetMutationMutation, RemoveTopOutputFromBlockSetMutationMutationVariables>;
export const CreateTopOutputBlockOnBlockSetMutationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateTopOutputBlockOnBlockSetMutation"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"blockSetId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UUID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createTopOutputBlockOnBlockSet"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"blockSetId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"blockSetId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"topOutputBlock"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]}}]} as unknown as DocumentNode<CreateTopOutputBlockOnBlockSetMutationMutation, CreateTopOutputBlockOnBlockSetMutationMutationVariables>;
export const UpdatePromptBlockMutationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdatePromptBlockMutation"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UUID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"content"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updatePromptBlock"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"role"},"value":{"kind":"EnumValue","value":"Assistant"}},{"kind":"Argument","name":{"kind":"Name","value":"content"},"value":{"kind":"Variable","name":{"kind":"Name","value":"content"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<UpdatePromptBlockMutationMutation, UpdatePromptBlockMutationMutationVariables>;
export const CreatePromptBlockMutationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreatePromptBlockMutation"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"workspaceId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UUID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createPromptBlock"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"workspaceId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"workspaceId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<CreatePromptBlockMutationMutation, CreatePromptBlockMutationMutationVariables>;
export const CreateCompleterBlockDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateCompleterBlock"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"workspaceId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UUID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createCompleterBlock"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"workspaceId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"workspaceId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<CreateCompleterBlockMutation, CreateCompleterBlockMutationVariables>;
export const CreateBlockSetDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateBlockSet"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"presetId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UUID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createBlockSet"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"presetId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"presetId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<CreateBlockSetMutation, CreateBlockSetMutationVariables>;
export const UpdateWorkspaceMutationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateWorkspaceMutation"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"workspaceId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UUID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"name"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateWorkspace"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"workspaceId"}}},{"kind":"Argument","name":{"kind":"Name","value":"name"},"value":{"kind":"Variable","name":{"kind":"Name","value":"name"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<UpdateWorkspaceMutationMutation, UpdateWorkspaceMutationMutationVariables>;
export const DeleteWorkspaceMutationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteWorkspaceMutation"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"workspaceId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UUID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteWorkspace"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"workspaceId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"isSuccess"}}]}}]}}]} as unknown as DocumentNode<DeleteWorkspaceMutationMutation, DeleteWorkspaceMutationMutationVariables>;
export const SpaceQueryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"SpaceQuery"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"spaceId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UUID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","alias":{"kind":"Name","value":"result"},"name":{"kind":"Name","value":"space"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"spaceId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"isReadOnly"}},{"kind":"Field","name":{"kind":"Name","value":"space"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"SpaceSubHeaderFragment"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"content"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SpaceSubHeaderFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Space"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]} as unknown as DocumentNode<SpaceQueryQuery, SpaceQueryQueryVariables>;
export const UpdateSpaceContentMutationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateSpaceContentMutation"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"spaceId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"content"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateSpace"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"spaceId"}}},{"kind":"Argument","name":{"kind":"Name","value":"content"},"value":{"kind":"Variable","name":{"kind":"Name","value":"content"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"content"}}]}}]}}]} as unknown as DocumentNode<UpdateSpaceContentMutationMutation, UpdateSpaceContentMutationMutationVariables>;
export const UpdateSpaceNameMutationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateSpaceNameMutation"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"spaceId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"name"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateSpace"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"spaceId"}}},{"kind":"Argument","name":{"kind":"Name","value":"name"},"value":{"kind":"Variable","name":{"kind":"Name","value":"name"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"content"}}]}}]}}]} as unknown as DocumentNode<UpdateSpaceNameMutationMutation, UpdateSpaceNameMutationMutationVariables>;
export const DeleteSpaceMutationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteSpaceMutation"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"spaceId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","alias":{"kind":"Name","value":"result"},"name":{"kind":"Name","value":"deleteSpace"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"spaceId"}}}]}]}}]} as unknown as DocumentNode<DeleteSpaceMutationMutation, DeleteSpaceMutationMutationVariables>;