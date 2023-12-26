import type { Observable } from 'rxjs';
import NodeExecutionContext from './NodeExecutionContext';
import type { V3VariableValueLookUpDict, Variable } from './connector-types';
import type { NodeID, V3VariableID } from './id-types';
import type { LocalNode } from './local-node-types';

// NOTE: This is a circular dependency, only import type
import type { NodeConfig } from '../nodes';

export interface NodeDefinition<T extends NodeConfig> {
  nodeType: T['type'];

  isEnabledInToolbar?: boolean;
  toolbarLabel?: string;

  createDefaultNodeConfig: (node: LocalNode) => {
    nodeConfig: T;
    variableConfigList: Variable[];
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
      finishedConnectorIds: V3VariableID[];
    }
  | {
      type: NodeExecutionEventType.VariableValues;
      nodeId: NodeID;
      // NOTE: Event should always contain all variable values
      variableValuesLookUpDict: V3VariableValueLookUpDict;
    }
  | {
      type: NodeExecutionEventType.Errors;
      nodeId: NodeID;
      // NOTE: Event should always contain all error messages
      errMessages: string[];
    };

export type NodeExecutionConfig<T extends NodeConfig> = {
  nodeConfig: T;
  connectorList: Variable[];
};

export type NodeExecutionParams = {
  nodeInputValueMap: V3VariableValueLookUpDict;
  useStreaming: boolean;
  openAiApiKey: string | null;
  huggingFaceApiToken: string | null;
  elevenLabsApiKey: string | null;
};
