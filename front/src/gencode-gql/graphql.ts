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
  DateTime: { input: any; output: any; }
  /** A field whose value is a generic Universally Unique Identifier: https://en.wikipedia.org/wiki/Universally_unique_identifier. */
  UUID: { input: any; output: any; }
};

export type CsvEvaluationPreset = {
  __typename?: 'CSVEvaluationPreset';
  configContent?: Maybe<Scalars['String']['output']>;
  csvContent: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
};

export enum ContentVersion {
  V3 = 'v3',
  V4 = 'v4'
}

export type CreateCsvEvaluationPresetResult = {
  __typename?: 'CreateCsvEvaluationPresetResult';
  csvEvaluationPreset: CsvEvaluationPreset;
  space: Space;
};

export type Mutation = {
  __typename?: 'Mutation';
  createCsvEvaluationPreset?: Maybe<CreateCsvEvaluationPresetResult>;
  createExampleSpace: Space;
  createSpace?: Maybe<Space>;
  deleteCsvEvaluationPreset?: Maybe<Space>;
  deleteSpace?: Maybe<Scalars['Boolean']['output']>;
  updateCsvEvaluationPreset?: Maybe<CsvEvaluationPreset>;
  updateSpace?: Maybe<Space>;
};


export type MutationCreateCsvEvaluationPresetArgs = {
  configContent?: InputMaybe<Scalars['String']['input']>;
  csvContent?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  spaceId: Scalars['ID']['input'];
};


export type MutationDeleteCsvEvaluationPresetArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteSpaceArgs = {
  id: Scalars['ID']['input'];
};


export type MutationUpdateCsvEvaluationPresetArgs = {
  configContent?: InputMaybe<Scalars['String']['input']>;
  csvContent?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  presetId: Scalars['ID']['input'];
};


export type MutationUpdateSpaceArgs = {
  canvasDataV4?: InputMaybe<Scalars['String']['input']>;
  contentV3?: InputMaybe<Scalars['String']['input']>;
  contentVersion?: InputMaybe<ContentVersion>;
  id: Scalars['ID']['input'];
  name?: InputMaybe<Scalars['String']['input']>;
};

export type Query = {
  __typename?: 'Query';
  hello: Scalars['String']['output'];
  space?: Maybe<Space>;
  user?: Maybe<User>;
};


export type QuerySpaceArgs = {
  id: Scalars['UUID']['input'];
};

export type Space = {
  __typename?: 'Space';
  canvasData?: Maybe<Scalars['String']['output']>;
  canvasDataSchemaVersion: ContentVersion;
  csvEvaluationPreset: CsvEvaluationPreset;
  csvEvaluationPresets: Array<CsvEvaluationPreset>;
  id: Scalars['ID']['output'];
  isReadOnly: Scalars['Boolean']['output'];
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
  isPlaceholderUser: Scalars['Boolean']['output'];
  profilePictureUrl?: Maybe<Scalars['String']['output']>;
  spaces: Array<Space>;
};

export type RootRouteLoaderQueryQueryVariables = Exact<{ [key: string]: never; }>;


export type RootRouteLoaderQueryQuery = { __typename?: 'Query', user?: { __typename?: 'User', isPlaceholderUser: boolean, id: any, email?: string | null } | null };

export type RouteDashboardCreateExampleSpaceMutationMutationVariables = Exact<{ [key: string]: never; }>;


export type RouteDashboardCreateExampleSpaceMutationMutation = { __typename?: 'Mutation', space: { __typename?: 'Space', id: string } };

export type CreateSpaceMutationMutationVariables = Exact<{ [key: string]: never; }>;


export type CreateSpaceMutationMutation = { __typename?: 'Mutation', result?: { __typename?: 'Space', id: string, name: string, updatedAt: any } | null };

export type DashboardFragment = { __typename?: 'User', spaces: Array<{ __typename?: 'Space', id: string, name: string, updatedAt: any, canvasDataSchemaVersion: ContentVersion }> } & { ' $fragmentName'?: 'DashboardFragment' };

export type RootRouteQueryQueryVariables = Exact<{ [key: string]: never; }>;


export type RootRouteQueryQuery = { __typename?: 'Query', user?: (
    { __typename?: 'User', id: any }
    & { ' $fragmentRefs'?: { 'DashboardFragment': DashboardFragment } }
  ) | null };

export type SpaceContentVersionQueryQueryVariables = Exact<{
  spaceId: Scalars['UUID']['input'];
}>;


export type SpaceContentVersionQueryQuery = { __typename?: 'Query', space?: { __typename?: 'Space', id: string, isReadOnly: boolean, canvasDataSchemaVersion: ContentVersion } | null };

export type UpdateSpaceContentV4MutationMutationVariables = Exact<{
  spaceId: Scalars['ID']['input'];
  canvasData: Scalars['String']['input'];
}>;


export type UpdateSpaceContentV4MutationMutation = { __typename?: 'Mutation', updateSpace?: { __typename?: 'Space', id: string, canvasData?: string | null } | null };

export type LoadCsvEvaluationPresetQueryVariables = Exact<{
  spaceId: Scalars['UUID']['input'];
  presetId: Scalars['ID']['input'];
}>;


export type LoadCsvEvaluationPresetQuery = { __typename?: 'Query', space?: { __typename?: 'Space', id: string, csvEvaluationPreset: { __typename?: 'CSVEvaluationPreset', id: string, csvContent: string, configContent?: string | null } } | null };

export type DeleteCsvEvaluationPresetMutationMutationVariables = Exact<{
  presetId: Scalars['ID']['input'];
}>;


export type DeleteCsvEvaluationPresetMutationMutation = { __typename?: 'Mutation', space?: { __typename?: 'Space', id: string, csvEvaluationPresets: Array<{ __typename?: 'CSVEvaluationPreset', id: string }> } | null };

export type CreateCsvEvaluationPresetMutationMutationVariables = Exact<{
  spaceId: Scalars['ID']['input'];
  name: Scalars['String']['input'];
  csvContent?: InputMaybe<Scalars['String']['input']>;
  configContent?: InputMaybe<Scalars['String']['input']>;
}>;


export type CreateCsvEvaluationPresetMutationMutation = { __typename?: 'Mutation', result?: { __typename?: 'CreateCsvEvaluationPresetResult', space: { __typename?: 'Space', id: string, csvEvaluationPresets: Array<{ __typename?: 'CSVEvaluationPreset', id: string }> }, csvEvaluationPreset: { __typename?: 'CSVEvaluationPreset', id: string, name: string, csvContent: string, configContent?: string | null } } | null };

export type UpdateCsvEvaluationPresetMutationMutationVariables = Exact<{
  presetId: Scalars['ID']['input'];
  name?: InputMaybe<Scalars['String']['input']>;
  csvContent?: InputMaybe<Scalars['String']['input']>;
  configContent?: InputMaybe<Scalars['String']['input']>;
}>;


export type UpdateCsvEvaluationPresetMutationMutation = { __typename?: 'Mutation', updateCsvEvaluationPreset?: { __typename?: 'CSVEvaluationPreset', id: string, name: string, csvContent: string, configContent?: string | null } | null };

export type SavePresetConfigContentMutationVariables = Exact<{
  presetId: Scalars['ID']['input'];
  configContent: Scalars['String']['input'];
}>;


export type SavePresetConfigContentMutation = { __typename?: 'Mutation', updateCsvEvaluationPreset?: { __typename?: 'CSVEvaluationPreset', id: string, configContent?: string | null } | null };

export type SpaceFlowQueryQueryVariables = Exact<{
  spaceId: Scalars['UUID']['input'];
}>;


export type SpaceFlowQueryQuery = { __typename?: 'Query', space?: { __typename?: 'Space', id: string, name: string, canvasDataSchemaVersion: ContentVersion, canvasData?: string | null } | null };

export type HeaderAccountDetailQueryQueryVariables = Exact<{ [key: string]: never; }>;


export type HeaderAccountDetailQueryQuery = { __typename?: 'Query', user?: { __typename?: 'User', isPlaceholderUser: boolean, id: any, email?: string | null, profilePictureUrl?: string | null } | null };

export type HeaderSpaceNameQueryQueryVariables = Exact<{
  spaceId: Scalars['UUID']['input'];
}>;


export type HeaderSpaceNameQueryQuery = { __typename?: 'Query', space?: { __typename?: 'Space', id: string, isReadOnly: boolean, name: string } | null };

export type UpdateSpaceNameMutationMutationVariables = Exact<{
  spaceId: Scalars['ID']['input'];
  name: Scalars['String']['input'];
}>;


export type UpdateSpaceNameMutationMutation = { __typename?: 'Mutation', space?: { __typename?: 'Space', id: string, name: string } | null };

export type PresetSelectorQueryQueryVariables = Exact<{
  spaceId: Scalars['UUID']['input'];
}>;


export type PresetSelectorQueryQuery = { __typename?: 'Query', space?: { __typename?: 'Space', id: string, csvEvaluationPresets: Array<{ __typename?: 'CSVEvaluationPreset', id: string, name: string }> } | null };

export const DashboardFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"Dashboard"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"User"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"spaces"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"canvasDataSchemaVersion"}}]}}]}}]} as unknown as DocumentNode<DashboardFragment, unknown>;
export const RootRouteLoaderQueryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"RootRouteLoaderQuery"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"isPlaceholderUser"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}}]}}]}}]} as unknown as DocumentNode<RootRouteLoaderQueryQuery, RootRouteLoaderQueryQueryVariables>;
export const RouteDashboardCreateExampleSpaceMutationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RouteDashboardCreateExampleSpaceMutation"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","alias":{"kind":"Name","value":"space"},"name":{"kind":"Name","value":"createExampleSpace"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<RouteDashboardCreateExampleSpaceMutationMutation, RouteDashboardCreateExampleSpaceMutationMutationVariables>;
export const CreateSpaceMutationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateSpaceMutation"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","alias":{"kind":"Name","value":"result"},"name":{"kind":"Name","value":"createSpace"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<CreateSpaceMutationMutation, CreateSpaceMutationMutationVariables>;
export const RootRouteQueryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"RootRouteQuery"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"FragmentSpread","name":{"kind":"Name","value":"Dashboard"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"Dashboard"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"User"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"spaces"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"canvasDataSchemaVersion"}}]}}]}}]} as unknown as DocumentNode<RootRouteQueryQuery, RootRouteQueryQueryVariables>;
export const SpaceContentVersionQueryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"SpaceContentVersionQuery"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"spaceId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UUID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"space"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"spaceId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"isReadOnly"}},{"kind":"Field","name":{"kind":"Name","value":"canvasDataSchemaVersion"}}]}}]}}]} as unknown as DocumentNode<SpaceContentVersionQueryQuery, SpaceContentVersionQueryQueryVariables>;
export const UpdateSpaceContentV4MutationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateSpaceContentV4Mutation"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"spaceId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"canvasData"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateSpace"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"spaceId"}}},{"kind":"Argument","name":{"kind":"Name","value":"contentVersion"},"value":{"kind":"EnumValue","value":"v4"}},{"kind":"Argument","name":{"kind":"Name","value":"canvasDataV4"},"value":{"kind":"Variable","name":{"kind":"Name","value":"canvasData"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"canvasData"}}]}}]}}]} as unknown as DocumentNode<UpdateSpaceContentV4MutationMutation, UpdateSpaceContentV4MutationMutationVariables>;
export const LoadCsvEvaluationPresetDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"LoadCsvEvaluationPreset"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"spaceId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UUID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"presetId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"space"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"spaceId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"csvEvaluationPreset"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"presetId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"csvContent"}},{"kind":"Field","name":{"kind":"Name","value":"configContent"}}]}}]}}]}}]} as unknown as DocumentNode<LoadCsvEvaluationPresetQuery, LoadCsvEvaluationPresetQueryVariables>;
export const DeleteCsvEvaluationPresetMutationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteCsvEvaluationPresetMutation"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"presetId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","alias":{"kind":"Name","value":"space"},"name":{"kind":"Name","value":"deleteCsvEvaluationPreset"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"presetId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"csvEvaluationPresets"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]}}]} as unknown as DocumentNode<DeleteCsvEvaluationPresetMutationMutation, DeleteCsvEvaluationPresetMutationMutationVariables>;
export const CreateCsvEvaluationPresetMutationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateCsvEvaluationPresetMutation"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"spaceId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"name"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"csvContent"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"configContent"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","alias":{"kind":"Name","value":"result"},"name":{"kind":"Name","value":"createCsvEvaluationPreset"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"spaceId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"spaceId"}}},{"kind":"Argument","name":{"kind":"Name","value":"name"},"value":{"kind":"Variable","name":{"kind":"Name","value":"name"}}},{"kind":"Argument","name":{"kind":"Name","value":"csvContent"},"value":{"kind":"Variable","name":{"kind":"Name","value":"csvContent"}}},{"kind":"Argument","name":{"kind":"Name","value":"configContent"},"value":{"kind":"Variable","name":{"kind":"Name","value":"configContent"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"space"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"csvEvaluationPresets"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"csvEvaluationPreset"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"csvContent"}},{"kind":"Field","name":{"kind":"Name","value":"configContent"}}]}}]}}]}}]} as unknown as DocumentNode<CreateCsvEvaluationPresetMutationMutation, CreateCsvEvaluationPresetMutationMutationVariables>;
export const UpdateCsvEvaluationPresetMutationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateCsvEvaluationPresetMutation"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"presetId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"name"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"csvContent"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"configContent"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateCsvEvaluationPreset"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"presetId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"presetId"}}},{"kind":"Argument","name":{"kind":"Name","value":"name"},"value":{"kind":"Variable","name":{"kind":"Name","value":"name"}}},{"kind":"Argument","name":{"kind":"Name","value":"csvContent"},"value":{"kind":"Variable","name":{"kind":"Name","value":"csvContent"}}},{"kind":"Argument","name":{"kind":"Name","value":"configContent"},"value":{"kind":"Variable","name":{"kind":"Name","value":"configContent"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"csvContent"}},{"kind":"Field","name":{"kind":"Name","value":"configContent"}}]}}]}}]} as unknown as DocumentNode<UpdateCsvEvaluationPresetMutationMutation, UpdateCsvEvaluationPresetMutationMutationVariables>;
export const SavePresetConfigContentDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SavePresetConfigContent"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"presetId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"configContent"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateCsvEvaluationPreset"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"presetId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"presetId"}}},{"kind":"Argument","name":{"kind":"Name","value":"configContent"},"value":{"kind":"Variable","name":{"kind":"Name","value":"configContent"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"configContent"}}]}}]}}]} as unknown as DocumentNode<SavePresetConfigContentMutation, SavePresetConfigContentMutationVariables>;
export const SpaceFlowQueryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"SpaceFlowQuery"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"spaceId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UUID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"space"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"spaceId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"canvasDataSchemaVersion"}},{"kind":"Field","name":{"kind":"Name","value":"canvasData"}}]}}]}}]} as unknown as DocumentNode<SpaceFlowQueryQuery, SpaceFlowQueryQueryVariables>;
export const HeaderAccountDetailQueryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"HeaderAccountDetailQuery"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"isPlaceholderUser"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"profilePictureUrl"}}]}}]}}]} as unknown as DocumentNode<HeaderAccountDetailQueryQuery, HeaderAccountDetailQueryQueryVariables>;
export const HeaderSpaceNameQueryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"HeaderSpaceNameQuery"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"spaceId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UUID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"space"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"spaceId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"isReadOnly"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]} as unknown as DocumentNode<HeaderSpaceNameQueryQuery, HeaderSpaceNameQueryQueryVariables>;
export const UpdateSpaceNameMutationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateSpaceNameMutation"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"spaceId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"name"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","alias":{"kind":"Name","value":"space"},"name":{"kind":"Name","value":"updateSpace"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"spaceId"}}},{"kind":"Argument","name":{"kind":"Name","value":"name"},"value":{"kind":"Variable","name":{"kind":"Name","value":"name"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]} as unknown as DocumentNode<UpdateSpaceNameMutationMutation, UpdateSpaceNameMutationMutationVariables>;
export const PresetSelectorQueryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"PresetSelectorQuery"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"spaceId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UUID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"space"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"spaceId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"csvEvaluationPresets"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}}]} as unknown as DocumentNode<PresetSelectorQueryQuery, PresetSelectorQueryQueryVariables>;