import type { ReactNode } from 'react';
import type { Observable } from 'rxjs';

import type {
  Connector,
  ConnectorID,
  ConnectorResultMap,
  NodeID,
} from '../base-types';
import type {
  NodeCompleteConfig,
  NodeConfig,
  NodeType,
} from '../node-definitions/index';
import NodeExecutionContext from './NodeExecutionContext';
import {
  FieldDefinition,
  GlobalFieldDefinition,
} from './field-definition-interfaces';

type IncomingVariableConfig = {
  isNonEditable: boolean;
  helperMessage?: ReactNode;
};

type BaseNodeConfig = {
  type: NodeType;
};

export interface NodeDefinition<
  T1 extends NodeConfig,
  T2 extends NodeCompleteConfig,
> {
  type: T1['type'];
  label?: string;

  isEnabledInToolbar?: boolean;

  // TODO: Abstract side panel rendering
  sidePanelType?: string;

  canAddIncomingVariables?: boolean;
  incomingVariableConfigs?: IncomingVariableConfig[];
  fieldDefinitions?: Record<string, FieldDefinition>;
  globalFieldDefinitions?: Record<string, GlobalFieldDefinition>;

  createDefaultNodeConfig: (nodeId: NodeID) => {
    nodeConfig: T1;
    variableConfigList: Connector[];
  };

  createNodeExecutionObservable: (
    context: NodeExecutionContext,
    nodeExecutionConfig: NodeExecutionConfig<T2>,
    params: NodeExecutionParams,
  ) => Observable<NodeExecutionEvent>;
}

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
      errMessages: string[];
    };

export type NodeExecutionConfig<T extends NodeConfig> = {
  nodeConfig: T;
  connectorList: Connector[];
};

export type NodeExecutionParams = {
  nodeInputValueMap: ConnectorResultMap;
  useStreaming: boolean;
  openAiApiKey: string | null;
  huggingFaceApiToken: string | null;
  elevenLabsApiKey: string | null;
};
