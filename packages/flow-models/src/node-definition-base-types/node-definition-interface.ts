import type { ReactNode } from 'react';
import type { Observable } from 'rxjs';

import type {
  Connector,
  ConnectorID,
  ConnectorResultMap,
  NodeID,
} from '../base-types';
import type { NodeType } from '../node-definitions/index';
import NodeExecutionContext from './NodeExecutionContext';
import {
  NodeAccountLevelTextFieldDefinition,
  NodeInstanceLevelFieldDefinitionUnion,
} from './field-definition-interfaces';

type BaseNodeInstanceLevelConfig = {
  type: NodeType;
  nodeId: string;
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
  helperMessage?: ReactNode;
};

export enum NodeExecutionEventType {
  // NOTE: All node execution will guarantee to have a start and finish event.
  Start = 'Start',
  Finish = 'Finish',

  VariableValues = 'NewVariableValues',
  // NOTE: Errors won't necessarily stop the execution
  Errors = 'Errors',
}

export type NodeExecutionEvent =
  | {
      type: NodeExecutionEventType.Start;
      nodeId: NodeID;
    }
  | {
      type: NodeExecutionEventType.Finish;
      nodeId: NodeID;
      finishedConnectorIds: ConnectorID[];
    }
  | {
      type: NodeExecutionEventType.VariableValues;
      nodeId: NodeID;
      // NOTE: Event should always contain all variable values
      variableValuesLookUpDict: ConnectorResultMap;
    }
  | {
      type: NodeExecutionEventType.Errors;
      nodeId: NodeID;
      // NOTE: Event should always contain all error messages
      errorMessages: string[];
    };

export type NodeExecutionConfig<T> = {
  nodeConfig: Readonly<T>;
  connectorList: Connector[];
};

export type NodeExecutionParams = {
  nodeInputValueMap: ConnectorResultMap;
  useStreaming: boolean;
};

export type CreateNodeExecutionObservableFunction<T> = (
  context: NodeExecutionContext,
  nodeExecutionConfig: NodeExecutionConfig<T>,
  params: NodeExecutionParams,
) => Observable<NodeExecutionEvent>;

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

  // Initial config values
  createDefaultNodeConfig: (nodeId: NodeID) => {
    nodeConfig: TInstanceLevelConfig;
    variableConfigList: Connector[];
  };

  // Execution
  createNodeExecutionObservable: CreateNodeExecutionObservableFunction<TAllLevelConfig>;
}
