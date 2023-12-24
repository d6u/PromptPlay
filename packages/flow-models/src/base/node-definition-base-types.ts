import { D, pipe } from '@mobily/ts-belt';
import type { Observable } from 'rxjs';
import type { NodeID, V3VariableID } from './id-types';
import type { NodeType, V3NodeConfig } from './node-types';
import {
  VariableType,
  type LocalNode,
  type V3NodeConfigsDict,
  type V3VariableValueLookUpDict,
  type Variable,
  type VariablesDict,
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

export interface NodeDefinition {
  nodeType: NodeType;

  isEnabledInToolbar?: boolean;
  toolbarLabel?: string;

  createDefaultNodeConfig: (node: LocalNode) => {
    nodeConfig: V3NodeConfig;
    variableConfigList: Variable[];
  };

  createNodeExecutionObservable: (
    context: NodeExecutionContext,
    nodeExecutionConfig: NodeExecutionConfig,
    params: NodeExecutionParams,
    // context: {
    //   variablesDict: VariablesDict;
    //   targetConnectorIdToSourceConnectorIdMap: Record<
    //     V3VariableID,
    //     V3VariableID
    //   >;
    //   sourceIdToValueMap: V3VariableValueLookUpDict;
    //   useStreaming: boolean;
    //   openAiApiKey: string | null;
    //   huggingFaceApiToken: string | null;
    //   elevenLabsApiKey: string | null;
    // },
  ) => Observable<NodeExecutionEvent>;
}

export type GraphEdge = {
  sourceNode: NodeID;
  sourceConnector: V3VariableID;
  targetNode: NodeID;
  targetConnector: V3VariableID;
};

export class FlowExecutionContext {
  constructor(
    edgeList: GraphEdge[],
    nodeConfigMap: V3NodeConfigsDict,
    connectorMap: VariablesDict,
  ) {
    this.srcConnIdToDstNodeIdListMap = {};
    this.variableDstConnIdToSrcConnIdMap = {};
    this.nodeIndegreeMap = D.map(nodeConfigMap, () => 0);

    for (const edge of edgeList) {
      if (this.srcConnIdToDstNodeIdListMap[edge.sourceConnector] == null) {
        this.srcConnIdToDstNodeIdListMap[edge.sourceConnector] = [];
      }

      this.srcConnIdToDstNodeIdListMap[edge.sourceConnector].push(
        edge.targetNode,
      );

      const srcConnector = connectorMap[edge.sourceConnector];
      // NOTE: We only need to map variable IDs. Condition IDs are not
      // mappable because one target ID can be connected to multiple source IDs.
      if (
        srcConnector.type === VariableType.FlowInput ||
        srcConnector.type === VariableType.NodeOutput
      ) {
        this.variableDstConnIdToSrcConnIdMap[edge.targetConnector] =
          edge.sourceConnector;
      }

      this.nodeIndegreeMap[edge.targetNode] += 1;
    }
  }

  private srcConnIdToDstNodeIdListMap: Record<V3VariableID, NodeID[]>;
  private variableDstConnIdToSrcConnIdMap: Record<V3VariableID, V3VariableID>;
  private nodeIndegreeMap: Record<NodeID, number> = {};

  getNodeIdListWithIndegreeZero(): NodeID[] {
    return pipe(
      this.nodeIndegreeMap,
      D.filter((indegree) => indegree === 0),
      D.keys,
    );
  }

  getSrcConnectorIdFromDstConnectorId(connectorId: V3VariableID): V3VariableID {
    return this.variableDstConnIdToSrcConnIdMap[connectorId] ?? [];
  }

  // NOTE: Return the list of nodes that have indegree become zero after
  // reducing the indegrees.
  reduceNodeIndegrees(srcConnectorIdList: V3VariableID[]): NodeID[] {
    const indegreeZeroNodeIdList: NodeID[] = [];

    for (const srcConnectorId of srcConnectorIdList) {
      // NOTE: `srcConnectorIdList` can contain source connector that is not
      // connected by a edge.
      this.srcConnIdToDstNodeIdListMap[srcConnectorId]?.forEach((nodeId) => {
        this.nodeIndegreeMap[nodeId] -= 1;

        if (this.nodeIndegreeMap[nodeId] === 0) {
          indegreeZeroNodeIdList.push(nodeId);
        }
      });
    }

    return indegreeZeroNodeIdList;
  }
}

export class NodeExecutionContext {
  constructor(public flowExecutionContext: FlowExecutionContext) {}
}

export type NodeExecutionConfig = {
  nodeConfig: V3NodeConfig;
  connectorList: Variable[];
};

export type NodeExecutionParams = {
  nodeInputValueMap: V3VariableValueLookUpDict;
  useStreaming: boolean;
  openAiApiKey: string | null;
  huggingFaceApiToken: string | null;
  elevenLabsApiKey: string | null;
};
