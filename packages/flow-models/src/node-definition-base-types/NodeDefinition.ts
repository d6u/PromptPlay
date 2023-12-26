import type { Observable } from 'rxjs';
import type {
  Connector,
  ConnectorID,
  ConnectorResultMap,
  NodeID,
} from '../base-types';
import NodeExecutionContext from './NodeExecutionContext';

// NOTE: This is a circular dependency, only import type
import type { NodeConfig } from '../nodes/index';

export interface NodeDefinition<T extends NodeConfig> {
  nodeType: T['type'];

  isEnabledInToolbar?: boolean;
  toolbarLabel?: string;

  createDefaultNodeConfig: (nodeId: NodeID) => {
    nodeConfig: T;
    variableConfigList: Connector[];
  };

  createNodeExecutionObservable: (
    context: NodeExecutionContext,
    nodeExecutionConfig: NodeExecutionConfig<T>,
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
