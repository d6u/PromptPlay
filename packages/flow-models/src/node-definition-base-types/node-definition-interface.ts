import type { ReactNode } from 'react';
import type { Observable } from 'rxjs';

import {
  Connector,
  VariableValueTypeEnum,
  type ConditionResultRecords,
  type VariableResultRecords,
} from '../base-types';
import NodeExecutionContext from './NodeExecutionContext';
import {
  NodeAccountLevelTextFieldDefinition,
  NodeInstanceLevelFieldDefinitionUnion,
} from './field-definition-interfaces';
import { NodeTypeEnum, type NodeClassEnum } from './node-class-and-type';

type BaseNodeInstanceLevelConfig = {
  class: NodeClassEnum;
  type: NodeTypeEnum;
  nodeId: string;
  nodeName?: string;
};

type ConvertToInstanceLevelFieldDefinitions<TInstanceLevel> = {
  [P in keyof Omit<
    TInstanceLevel,
    keyof BaseNodeInstanceLevelConfig
  >]: NodeInstanceLevelFieldDefinitionUnion;
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

export enum NodeExecutionEventType {
  // NOTE: All node execution will guarantee to have a start and finish event.
  Start = 'Start',
  Finish = 'Finish',

  VariableValues = 'NewVariableValues',
  // NOTE: Errors won't necessarily stop the execution
  Errors = 'Errors',
}

export type NodeExecutionConfig<T> = {
  nodeConfig: Readonly<T>;
  connectorList: Connector[];
};

export type NodeExecutionParams = {
  nodeInputValueMap: VariableResultRecords;
  useStreaming: boolean;
};

export type RunNodeResult = Partial<{
  errors: Array<string>;
  conditionResults: ConditionResultRecords;
  variableResults: VariableResultRecords;
  completedConnectorIds: Array<string>;
}>;

export type CreateNodeExecutionObservableFunction<T> = (
  context: NodeExecutionContext,
  nodeExecutionConfig: NodeExecutionConfig<T>,
  params: NodeExecutionParams,
) => Observable<RunNodeResult>;

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
  instanceLevelConfigFieldDefinitions: ConvertToInstanceLevelFieldDefinitions<TInstanceLevelConfig>;

  // Variables
  fixedIncomingVariables?: Record<string, FixedIncomingVariableDefinition>;
  canUserAddIncomingVariables?: boolean;
  // For start class only
  canUserAddNodeOutputVariable?: boolean;
  variableValueTypeForUserAddedIncomingVariable?: VariableValueTypeEnum;

  // Initial config values
  createDefaultNodeConfig: (nodeId: string) => {
    nodeConfig: TInstanceLevelConfig;
    variableConfigList: Connector[];
  };

  // Execution
  createNodeExecutionObservable: CreateNodeExecutionObservableFunction<TAllLevelConfig>;
}
