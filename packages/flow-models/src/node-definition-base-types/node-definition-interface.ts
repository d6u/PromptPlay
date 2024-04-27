import type { ReactNode } from 'react';
import type { Observable } from 'rxjs';

import {
  Connector,
  VariableValueTypeEnum,
  type ConditionResult,
  type NodeInputVariable,
  type NodeOutputVariable,
  type OutgoingCondition,
} from '../base-types';
import {
  NodeAccountLevelTextFieldDefinition,
  NodeInstanceLevelFieldDefinitionUnion,
} from './field-definition-interfaces';
import { NodeTypeEnum, type NodeKindEnum } from './node-class-and-type';

export type BaseNodeInstanceLevelConfig = {
  kind: NodeKindEnum;
  type: NodeTypeEnum;
  nodeId: string;
  nodeName?: string;
};

type ConvertToAccountLevelFieldDefinitions<
  TAllLevelConfig,
  TInstanceLevelConfig,
> = {
  [P in keyof Omit<
    TAllLevelConfig,
    keyof TInstanceLevelConfig
  >]: NodeAccountLevelTextFieldDefinition;
};

type FixedIncomingVariableDefinition = {
  // Define helperMessage as a function so that we don't have to execute it's
  // jsx code when not needed, e.g. on the server side.
  helperMessage?: () => ReactNode;
};

export type RunNodeParams<T> = {
  // canvas data for current node
  nodeConfig: Readonly<T>;
  inputVariables: NodeInputVariable[];
  outputVariables: NodeOutputVariable[];
  outgoingConditions: OutgoingCondition[];
  inputVariableValues: unknown[];
  // run options
  preferStreaming: boolean;
};

export type RunNodeResult = Partial<{
  errors: string[];
  conditionResults: ConditionResult[];
  variableValues: unknown[];
}>;

export type CreateNodeExecutionObservableFunction<T> = (
  params: RunNodeParams<T>,
) => Observable<RunNodeResult>;

export type RunNodeFunction<T> = (
  params: RunNodeParams<T>,
) => Promise<RunNodeResult>;

type CreateDefaultNodeConfigContext = {
  generateNodeId(): string;
  generateConnectorId(nodeId: string): string;
};

type CreateDefaultNodeConfigReturn = {
  nodeConfigs: BaseNodeInstanceLevelConfig[];
  connectors: Connector[];
};

export interface NodeDefinition<
  TInstanceLevelConfig extends BaseNodeInstanceLevelConfig,
  TAllLevelConfig extends TInstanceLevelConfig,
> {
  type: TInstanceLevelConfig['type'];

  // Used for displaying in UI
  label: string;

  // Node Config
  accountLevelConfigFieldDefinitions?: ConvertToAccountLevelFieldDefinitions<
    TAllLevelConfig,
    TInstanceLevelConfig
  >;
  configFields: NodeInstanceLevelFieldDefinitionUnion[];

  // Variables
  fixedIncomingVariables?: Record<string, FixedIncomingVariableDefinition>;
  canUserAddIncomingVariables?: boolean;
  // For start class only
  canUserAddNodeOutputVariable?: boolean;
  variableValueTypeForUserAddedIncomingVariable?: VariableValueTypeEnum;

  // Initial config values
  createDefaultNodeConfigsAndConnectors: (
    context: CreateDefaultNodeConfigContext,
  ) => CreateDefaultNodeConfigReturn;

  // Execution
  createNodeExecutionObservable?: CreateNodeExecutionObservableFunction<TAllLevelConfig>;
  runNode?: RunNodeFunction<TAllLevelConfig>;
}
