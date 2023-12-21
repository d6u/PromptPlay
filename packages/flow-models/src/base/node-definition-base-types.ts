import type { Observable } from 'rxjs';
import type { NodeID, V3VariableID } from './id-types';
import type { NodeType, V3NodeConfig } from './node-types';
import type {
  LocalNode,
  V3VariableValueLookUpDict,
  Variable,
  VariablesDict,
} from './v3-flow-content-types';

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

export interface NodeDefinition {
  nodeType: NodeType;

  isEnabledInToolbar?: boolean;
  toolbarLabel?: string;

  createDefaultNodeConfig: (node: LocalNode) => {
    nodeConfig: V3NodeConfig;
    variableConfigList: Variable[];
  };

  createNodeExecutionObservable: (
    nodeConfig: V3NodeConfig,
    context: {
      variablesDict: VariablesDict;
      edgeTargetHandleToSourceHandleLookUpDict: Record<
        V3VariableID,
        V3VariableID
      >;
      outputIdToValueMap: V3VariableValueLookUpDict;
      useStreaming: boolean;
      openAiApiKey: string | null;
      huggingFaceApiToken: string | null;
      elevenLabsApiKey: string | null;
    },
  ) => Observable<NodeExecutionEvent>;
}
