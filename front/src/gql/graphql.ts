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

export type CsvEvaluationPreset = {
  __typename?: 'CSVEvaluationPreset';
  configContent?: Maybe<Scalars['String']['output']>;
  csvContent: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
};

export type CompleterBlock = Block & {
  __typename?: 'CompleterBlock';
  id: Scalars['UUID']['output'];
  model: Scalars['String']['output'];
  stop: Scalars['String']['output'];
  temperature: Scalars['Float']['output'];
};

export enum ContentVersion {
  V1 = 'v1',
  V2 = 'v2',
  V3 = 'v3'
}

export type CreateCsvEvaluationPresetResult = {
  __typename?: 'CreateCsvEvaluationPresetResult';
  csvEvaluationPreset: CsvEvaluationPreset;
  space: Space;
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
  createCsvEvaluationPreset?: Maybe<CreateCsvEvaluationPresetResult>;
  createExampleWorkspace?: Maybe<CreateExampleWorkspaceResult>;
  createPlaceholderUserAndExampleSpace: CreatePlaceholderUserAndExampleSpaceResult;
  createPromptBlock?: Maybe<PromptBlock>;
  createSpace?: Maybe<Space>;
  createTopOutputBlockOnBlockSet?: Maybe<BlockSet>;
  createWorkspace?: Maybe<Workspace>;
  deleteBlock?: Maybe<DeletionResult>;
  deleteBlockSet?: Maybe<DeletionResult>;
  deleteCsvEvaluationPreset?: Maybe<Space>;
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
  updateCsvEvaluationPreset?: Maybe<CsvEvaluationPreset>;
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


export type MutationCreateCsvEvaluationPresetArgs = {
  csvContent?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  spaceId: Scalars['ID']['input'];
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


export type MutationDeleteCsvEvaluationPresetArgs = {
  id: Scalars['ID']['input'];
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


export type MutationUpdateCsvEvaluationPresetArgs = {
  csvContent?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  presetId: Scalars['ID']['input'];
};


export type MutationUpdatePromptBlockArgs = {
  content: Scalars['String']['input'];
  id: Scalars['UUID']['input'];
  role: PromptType;
};


export type MutationUpdateSpaceArgs = {
  content?: InputMaybe<Scalars['String']['input']>;
  contentV3?: InputMaybe<Scalars['String']['input']>;
  contentVersion?: InputMaybe<ContentVersion>;
  flowContent?: InputMaybe<Scalars['String']['input']>;
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
  contentV3?: Maybe<Scalars['String']['output']>;
  contentVersion: ContentVersion;
  csvEvaluationPreset: CsvEvaluationPreset;
  csvEvaluationPresets: Array<CsvEvaluationPreset>;
  flowContent?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
};


export type SpaceCsvEvaluationPresetArgs = {
  id: Scalars['ID']['input'];
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

export type SpaceContentVersionQueryQueryVariables = Exact<{
  spaceId: Scalars['UUID']['input'];
}>;


export type SpaceContentVersionQueryQuery = { __typename?: 'Query', space?: { __typename?: 'QuerySpaceResult', isReadOnly: boolean, space: { __typename?: 'Space', id: string, contentVersion: ContentVersion } } | null };

export type HeaderSpaceNameQueryQueryVariables = Exact<{
  spaceId: Scalars['UUID']['input'];
}>;


export type HeaderSpaceNameQueryQuery = { __typename?: 'Query', result?: { __typename?: 'QuerySpaceResult', isReadOnly: boolean, space: { __typename?: 'Space', id: string, name: string } } | null };

export type EvaluationModeCsvContentQueryQueryVariables = Exact<{
  spaceId: Scalars['UUID']['input'];
  presetId: Scalars['ID']['input'];
}>;


export type EvaluationModeCsvContentQueryQuery = { __typename?: 'Query', result?: { __typename?: 'QuerySpaceResult', space: { __typename?: 'Space', id: string, csvEvaluationPreset: { __typename?: 'CSVEvaluationPreset', id: string, csvContent: string, configContent?: string | null } } } | null };

export type PresetSelectorQueryQueryVariables = Exact<{
  spaceId: Scalars['UUID']['input'];
}>;


export type PresetSelectorQueryQuery = { __typename?: 'Query', result?: { __typename?: 'QuerySpaceResult', space: { __typename?: 'Space', id: string, csvEvaluationPresets: Array<{ __typename?: 'CSVEvaluationPreset', id: string, name: string }> } } | null };

export type SpaceFlowQueryQueryVariables = Exact<{
  spaceId: Scalars['UUID']['input'];
}>;


export type SpaceFlowQueryQuery = { __typename?: 'Query', result?: { __typename?: 'QuerySpaceResult', space: { __typename?: 'Space', id: string, name: string, contentVersion: ContentVersion, flowContent?: string | null, contentV3?: string | null } } | null };

export type UpdateSpaceContentV3MutationMutationVariables = Exact<{
  spaceId: Scalars['ID']['input'];
  contentV3: Scalars['String']['input'];
}>;


export type UpdateSpaceContentV3MutationMutation = { __typename?: 'Mutation', updateSpace?: { __typename?: 'Space', id: string, contentV3?: string | null } | null };

export type CreateCsvEvaluationPresetMutationMutationVariables = Exact<{
  spaceId: Scalars['ID']['input'];
  name: Scalars['String']['input'];
  csvContent?: InputMaybe<Scalars['String']['input']>;
}>;


export type CreateCsvEvaluationPresetMutationMutation = { __typename?: 'Mutation', result?: { __typename?: 'CreateCsvEvaluationPresetResult', space: { __typename?: 'Space', id: string, csvEvaluationPresets: Array<{ __typename?: 'CSVEvaluationPreset', id: string }> }, csvEvaluationPreset: { __typename?: 'CSVEvaluationPreset', id: string, name: string, csvContent: string, configContent?: string | null } } | null };

export type UpdateCsvEvaluationPresetMutationMutationVariables = Exact<{
  presetId: Scalars['ID']['input'];
  name?: InputMaybe<Scalars['String']['input']>;
  csvContent?: InputMaybe<Scalars['String']['input']>;
}>;


export type UpdateCsvEvaluationPresetMutationMutation = { __typename?: 'Mutation', updateCsvEvaluationPreset?: { __typename?: 'CSVEvaluationPreset', id: string, name: string, csvContent: string, configContent?: string | null } | null };

export type DeleteCsvEvaluationPresetMutationMutationVariables = Exact<{
  presetId: Scalars['ID']['input'];
}>;


export type DeleteCsvEvaluationPresetMutationMutation = { __typename?: 'Mutation', space?: { __typename?: 'Space', id: string, csvEvaluationPresets: Array<{ __typename?: 'CSVEvaluationPreset', id: string }> } | null };

export type DashboardFragment = { __typename?: 'User', spaces: Array<{ __typename?: 'Space', id: string, name: string, updatedAt: any, contentVersion: ContentVersion }> } & { ' $fragmentName'?: 'DashboardFragment' };

export type CreateSpaceMutationMutationVariables = Exact<{ [key: string]: never; }>;


export type CreateSpaceMutationMutation = { __typename?: 'Mutation', result?: { __typename?: 'Space', id: string, name: string, updatedAt: any } | null };

export type CreatePlaceholderUserAndExampleSpaceMutationMutationVariables = Exact<{ [key: string]: never; }>;


export type CreatePlaceholderUserAndExampleSpaceMutationMutation = { __typename?: 'Mutation', result: { __typename?: 'CreatePlaceholderUserAndExampleSpaceResult', placeholderClientToken: string, space: { __typename?: 'Space', id: string } } };

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

export type SpaceQueryQueryVariables = Exact<{
  spaceId: Scalars['UUID']['input'];
}>;


export type SpaceQueryQuery = { __typename?: 'Query', result?: { __typename?: 'QuerySpaceResult', isReadOnly: boolean, space: { __typename?: 'Space', id: string, name: string, contentVersion: ContentVersion, content?: string | null } } | null };

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

export const DashboardFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"Dashboard"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"User"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"spaces"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"contentVersion"}}]}}]}}]} as unknown as DocumentNode<DashboardFragment, unknown>;
export const SpaceContentVersionQueryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"SpaceContentVersionQuery"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"spaceId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UUID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"space"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"spaceId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"isReadOnly"}},{"kind":"Field","name":{"kind":"Name","value":"space"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"contentVersion"}}]}}]}}]}}]} as unknown as DocumentNode<SpaceContentVersionQueryQuery, SpaceContentVersionQueryQueryVariables>;
export const HeaderSpaceNameQueryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"HeaderSpaceNameQuery"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"spaceId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UUID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","alias":{"kind":"Name","value":"result"},"name":{"kind":"Name","value":"space"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"spaceId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"isReadOnly"}},{"kind":"Field","name":{"kind":"Name","value":"space"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}}]} as unknown as DocumentNode<HeaderSpaceNameQueryQuery, HeaderSpaceNameQueryQueryVariables>;
export const EvaluationModeCsvContentQueryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"EvaluationModeCSVContentQuery"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"spaceId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UUID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"presetId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","alias":{"kind":"Name","value":"result"},"name":{"kind":"Name","value":"space"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"spaceId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"space"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"csvEvaluationPreset"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"presetId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"csvContent"}},{"kind":"Field","name":{"kind":"Name","value":"configContent"}}]}}]}}]}}]}}]} as unknown as DocumentNode<EvaluationModeCsvContentQueryQuery, EvaluationModeCsvContentQueryQueryVariables>;
export const PresetSelectorQueryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"PresetSelectorQuery"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"spaceId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UUID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","alias":{"kind":"Name","value":"result"},"name":{"kind":"Name","value":"space"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"spaceId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"space"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"csvEvaluationPresets"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}}]}}]} as unknown as DocumentNode<PresetSelectorQueryQuery, PresetSelectorQueryQueryVariables>;
export const SpaceFlowQueryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"SpaceFlowQuery"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"spaceId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UUID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","alias":{"kind":"Name","value":"result"},"name":{"kind":"Name","value":"space"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"spaceId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"space"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"contentVersion"}},{"kind":"Field","name":{"kind":"Name","value":"flowContent"}},{"kind":"Field","name":{"kind":"Name","value":"contentV3"}}]}}]}}]}}]} as unknown as DocumentNode<SpaceFlowQueryQuery, SpaceFlowQueryQueryVariables>;
export const UpdateSpaceContentV3MutationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateSpaceContentV3Mutation"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"spaceId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"contentV3"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateSpace"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"spaceId"}}},{"kind":"Argument","name":{"kind":"Name","value":"contentVersion"},"value":{"kind":"EnumValue","value":"v3"}},{"kind":"Argument","name":{"kind":"Name","value":"contentV3"},"value":{"kind":"Variable","name":{"kind":"Name","value":"contentV3"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"contentV3"}}]}}]}}]} as unknown as DocumentNode<UpdateSpaceContentV3MutationMutation, UpdateSpaceContentV3MutationMutationVariables>;
export const CreateCsvEvaluationPresetMutationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateCsvEvaluationPresetMutation"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"spaceId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"name"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"csvContent"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","alias":{"kind":"Name","value":"result"},"name":{"kind":"Name","value":"createCsvEvaluationPreset"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"spaceId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"spaceId"}}},{"kind":"Argument","name":{"kind":"Name","value":"name"},"value":{"kind":"Variable","name":{"kind":"Name","value":"name"}}},{"kind":"Argument","name":{"kind":"Name","value":"csvContent"},"value":{"kind":"Variable","name":{"kind":"Name","value":"csvContent"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"space"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"csvEvaluationPresets"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"csvEvaluationPreset"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"csvContent"}},{"kind":"Field","name":{"kind":"Name","value":"configContent"}}]}}]}}]}}]} as unknown as DocumentNode<CreateCsvEvaluationPresetMutationMutation, CreateCsvEvaluationPresetMutationMutationVariables>;
export const UpdateCsvEvaluationPresetMutationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateCsvEvaluationPresetMutation"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"presetId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"name"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"csvContent"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateCsvEvaluationPreset"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"presetId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"presetId"}}},{"kind":"Argument","name":{"kind":"Name","value":"name"},"value":{"kind":"Variable","name":{"kind":"Name","value":"name"}}},{"kind":"Argument","name":{"kind":"Name","value":"csvContent"},"value":{"kind":"Variable","name":{"kind":"Name","value":"csvContent"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"csvContent"}},{"kind":"Field","name":{"kind":"Name","value":"configContent"}}]}}]}}]} as unknown as DocumentNode<UpdateCsvEvaluationPresetMutationMutation, UpdateCsvEvaluationPresetMutationMutationVariables>;
export const DeleteCsvEvaluationPresetMutationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteCsvEvaluationPresetMutation"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"presetId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","alias":{"kind":"Name","value":"space"},"name":{"kind":"Name","value":"deleteCsvEvaluationPreset"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"presetId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"csvEvaluationPresets"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]}}]} as unknown as DocumentNode<DeleteCsvEvaluationPresetMutationMutation, DeleteCsvEvaluationPresetMutationMutationVariables>;
export const CreateSpaceMutationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateSpaceMutation"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","alias":{"kind":"Name","value":"result"},"name":{"kind":"Name","value":"createSpace"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<CreateSpaceMutationMutation, CreateSpaceMutationMutationVariables>;
export const CreatePlaceholderUserAndExampleSpaceMutationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreatePlaceholderUserAndExampleSpaceMutation"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","alias":{"kind":"Name","value":"result"},"name":{"kind":"Name","value":"createPlaceholderUserAndExampleSpace"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"placeholderClientToken"}},{"kind":"Field","name":{"kind":"Name","value":"space"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]}}]} as unknown as DocumentNode<CreatePlaceholderUserAndExampleSpaceMutationMutation, CreatePlaceholderUserAndExampleSpaceMutationMutationVariables>;
export const HeaderQueryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"HeaderQuery"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"isLoggedIn"}},{"kind":"Field","name":{"kind":"Name","value":"isPlaceholderUserTokenInvalid"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"profilePictureUrl"}}]}}]}}]} as unknown as DocumentNode<HeaderQueryQuery, HeaderQueryQueryVariables>;
export const MergePlaceholderUserWithLoggedInUserMutationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"MergePlaceholderUserWithLoggedInUserMutation"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"placeholderUserToken"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","alias":{"kind":"Name","value":"result"},"name":{"kind":"Name","value":"mergePlaceholderUserWithLoggedInUser"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"placeholderUserToken"},"value":{"kind":"Variable","name":{"kind":"Name","value":"placeholderUserToken"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"spaces"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]}}]} as unknown as DocumentNode<MergePlaceholderUserWithLoggedInUserMutationMutation, MergePlaceholderUserWithLoggedInUserMutationMutationVariables>;
export const RootRouteQueryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"RootRouteQuery"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"FragmentSpread","name":{"kind":"Name","value":"Dashboard"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"Dashboard"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"User"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"spaces"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"contentVersion"}}]}}]}}]} as unknown as DocumentNode<RootRouteQueryQuery, RootRouteQueryQueryVariables>;
export const SpaceQueryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"SpaceQuery"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"spaceId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UUID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","alias":{"kind":"Name","value":"result"},"name":{"kind":"Name","value":"space"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"spaceId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"isReadOnly"}},{"kind":"Field","name":{"kind":"Name","value":"space"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"contentVersion"}},{"kind":"Field","name":{"kind":"Name","value":"content"}}]}}]}}]}}]} as unknown as DocumentNode<SpaceQueryQuery, SpaceQueryQueryVariables>;
export const UpdateSpaceContentMutationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateSpaceContentMutation"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"spaceId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"content"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateSpace"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"spaceId"}}},{"kind":"Argument","name":{"kind":"Name","value":"content"},"value":{"kind":"Variable","name":{"kind":"Name","value":"content"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"content"}}]}}]}}]} as unknown as DocumentNode<UpdateSpaceContentMutationMutation, UpdateSpaceContentMutationMutationVariables>;
export const UpdateSpaceNameMutationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateSpaceNameMutation"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"spaceId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"name"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateSpace"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"spaceId"}}},{"kind":"Argument","name":{"kind":"Name","value":"name"},"value":{"kind":"Variable","name":{"kind":"Name","value":"name"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"content"}}]}}]}}]} as unknown as DocumentNode<UpdateSpaceNameMutationMutation, UpdateSpaceNameMutationMutationVariables>;
export const DeleteSpaceMutationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteSpaceMutation"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"spaceId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","alias":{"kind":"Name","value":"result"},"name":{"kind":"Name","value":"deleteSpace"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"spaceId"}}}]}]}}]} as unknown as DocumentNode<DeleteSpaceMutationMutation, DeleteSpaceMutationMutationVariables>;