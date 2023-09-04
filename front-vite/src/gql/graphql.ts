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
  ID: { input: string; output: string; }
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
  mergePlaceholderUserWithLoggedInUser?: Maybe<User>;
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


export type HeaderQueryQuery = { __typename?: 'Query', isLoggedIn: boolean, isPlaceholderUserTokenInvalid: boolean, user?: { __typename?: 'User', id: any, email?: string | null, profilePictureUrl?: string | null } | null };

export type MergePlaceholderUserWithLoggedInUserMutationMutationVariables = Exact<{
  placeholderUserToken: Scalars['String']['input'];
}>;


export type MergePlaceholderUserWithLoggedInUserMutationMutation = { __typename?: 'Mutation', result?: { __typename?: 'User', id: any, spaces: Array<{ __typename?: 'Space', id: string }> } | null };

export type RootRouteQueryQueryVariables = Exact<{ [key: string]: never; }>;


export type RootRouteQueryQuery = { __typename?: 'Query', user?: (
    { __typename?: 'User', id: any }
    & { ' $fragmentRefs'?: { 'DashboardFragment': DashboardFragment } }
  ) | null };

export type SpaceSubHeaderFragmentFragment = { __typename?: 'Space', name: string } & { ' $fragmentName'?: 'SpaceSubHeaderFragmentFragment' };

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
export const LibraryBlockFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"LibraryBlock"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Block"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PromptBlock"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"content"}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CompleterBlock"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"model"}},{"kind":"Field","name":{"kind":"Name","value":"temperature"}},{"kind":"Field","name":{"kind":"Name","value":"stop"}}]}}]}}]} as unknown as DocumentNode<LibraryBlockFragment, unknown>;
export const DashboardFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"Dashboard"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"User"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"spaces"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<DashboardFragment, unknown>;
export const SpaceSubHeaderFragmentFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SpaceSubHeaderFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Space"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]} as unknown as DocumentNode<SpaceSubHeaderFragmentFragment, unknown>;
export const CreatePlaceholderUserAndExampleSpaceMutationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreatePlaceholderUserAndExampleSpaceMutation"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","alias":{"kind":"Name","value":"result"},"name":{"kind":"Name","value":"createPlaceholderUserAndExampleSpace"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"placeholderClientToken"}},{"kind":"Field","name":{"kind":"Name","value":"space"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]}}]} as unknown as DocumentNode<CreatePlaceholderUserAndExampleSpaceMutationMutation, CreatePlaceholderUserAndExampleSpaceMutationMutationVariables>;
export const CreateSpaceMutationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateSpaceMutation"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","alias":{"kind":"Name","value":"result"},"name":{"kind":"Name","value":"createSpace"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<CreateSpaceMutationMutation, CreateSpaceMutationMutationVariables>;
export const HeaderQueryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"HeaderQuery"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"isLoggedIn"}},{"kind":"Field","name":{"kind":"Name","value":"isPlaceholderUserTokenInvalid"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"profilePictureUrl"}}]}}]}}]} as unknown as DocumentNode<HeaderQueryQuery, HeaderQueryQueryVariables>;
export const MergePlaceholderUserWithLoggedInUserMutationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"MergePlaceholderUserWithLoggedInUserMutation"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"placeholderUserToken"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","alias":{"kind":"Name","value":"result"},"name":{"kind":"Name","value":"mergePlaceholderUserWithLoggedInUser"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"placeholderUserToken"},"value":{"kind":"Variable","name":{"kind":"Name","value":"placeholderUserToken"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"spaces"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]}}]} as unknown as DocumentNode<MergePlaceholderUserWithLoggedInUserMutationMutation, MergePlaceholderUserWithLoggedInUserMutationMutationVariables>;
export const RootRouteQueryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"RootRouteQuery"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"FragmentSpread","name":{"kind":"Name","value":"Dashboard"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"Dashboard"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"User"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"spaces"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<RootRouteQueryQuery, RootRouteQueryQueryVariables>;
export const SpaceQueryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"SpaceQuery"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"spaceId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UUID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","alias":{"kind":"Name","value":"result"},"name":{"kind":"Name","value":"space"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"spaceId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"isReadOnly"}},{"kind":"Field","name":{"kind":"Name","value":"space"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"SpaceSubHeaderFragment"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"content"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SpaceSubHeaderFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Space"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]} as unknown as DocumentNode<SpaceQueryQuery, SpaceQueryQueryVariables>;
export const UpdateSpaceContentMutationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateSpaceContentMutation"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"spaceId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"content"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateSpace"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"spaceId"}}},{"kind":"Argument","name":{"kind":"Name","value":"content"},"value":{"kind":"Variable","name":{"kind":"Name","value":"content"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"content"}}]}}]}}]} as unknown as DocumentNode<UpdateSpaceContentMutationMutation, UpdateSpaceContentMutationMutationVariables>;
export const UpdateSpaceNameMutationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateSpaceNameMutation"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"spaceId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"name"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateSpace"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"spaceId"}}},{"kind":"Argument","name":{"kind":"Name","value":"name"},"value":{"kind":"Variable","name":{"kind":"Name","value":"name"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"content"}}]}}]}}]} as unknown as DocumentNode<UpdateSpaceNameMutationMutation, UpdateSpaceNameMutationMutationVariables>;
export const DeleteSpaceMutationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteSpaceMutation"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"spaceId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","alias":{"kind":"Name","value":"result"},"name":{"kind":"Name","value":"deleteSpace"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"spaceId"}}}]}]}}]} as unknown as DocumentNode<DeleteSpaceMutationMutation, DeleteSpaceMutationMutationVariables>;