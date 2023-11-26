import { D } from "@mobily/ts-belt";
import {
  BehaviorSubject,
  catchError,
  concat,
  concatAll,
  defer,
  EMPTY,
  endWith,
  from,
  map,
  mergeMap,
  Observable,
  of,
  startWith,
  Subject,
  tap,
  throwError,
} from "rxjs";
import { NodeID, NodeType } from "../models/v2-flow-content-types";
import {
  V3FlowContent,
  V3NodeConfig,
  V3NodeConfigsDict,
  V3ServerEdge,
  V3VariableID,
  V3VariableValueLookUpDict,
  VariablesDict,
} from "../models/v3-flow-content-types";
import { handleChatGPTChatNode } from "./handleChatGPTChatNode";
import { handleChatGPTMessageNode } from "./handleChatGPTMessageNode";
import { handleElevenLabsNode } from "./handleElevenLabsNode";
import { handleHuggingFaceInferenceNode } from "./handleHuggingFaceInferenceNode";
import { handleJavaScriptFunctionNode } from "./handleJavaScriptFunctionNode";
import { handleOutputNode } from "./handleOutputNode";
import { handleTextTemplateNode } from "./handleTextTemplateNode";
import { RunEvent, RunEventType, RunStatusChangeEvent } from "./run-types";

export const AsyncFunction = async function () {}.constructor;

type Arguments = {
  flowContent: Readonly<V3FlowContent>;
  inputVariableMap: Readonly<V3VariableValueLookUpDict>;
  useStreaming?: boolean;
};

export function runSingle({
  flowContent,
  inputVariableMap,
  useStreaming = false,
}: Arguments): Observable<RunEvent> {
  const { nodeConfigsDict, edges, variablesDict } = flowContent;

  const outputIdToValueMap: V3VariableValueLookUpDict = { ...inputVariableMap };
  const edgeTargetHandleToSourceHandleLookUpDict: Record<
    V3VariableID,
    V3VariableID
  > = {};

  for (const edge of edges) {
    edgeTargetHandleToSourceHandleLookUpDict[edge.targetHandle] =
      edge.sourceHandle!;
  }

  // `signalSubject` is to control the pace of the execution and the termination.
  //
  // Because the observable below will emit all the nodes at once, we give `signalSubject`
  // a value one at a time and only give `signalSubject` a new value after one node in
  // the observable is finished executing. So that we can execute the node graph
  // in topological order.
  const signalSubject = new BehaviorSubject<void>(undefined);

  return createTopologicalSortNodeConfigListObservable({
    signalSubject,
    nodeConfigsDict,
    edges,
  }).pipe(
    mergeMap<V3NodeConfig[], Observable<RunEvent>>((nodeConfigs) => {
      if (nodeConfigs.length === 0) {
        // Completing the `signalSubject` will complete the observable after
        // the returned observable is completed.
        signalSubject.complete();
        return EMPTY;
      }

      const obsList: Observable<RunEvent>[] = nodeConfigs.map((nodeConfig) => {
        return createNodeConfigExecutionObservable({
          nodeConfig,
          context: {
            variablesDict,
            edgeTargetHandleToSourceHandleLookUpDict,
            outputIdToValueMap,
            useStreaming,
          },
        }).pipe(
          // startWith and endWith will run for each node, before and after
          // running its logic.
          map<V3VariableValueLookUpDict, RunEvent>((changes) => {
            return { type: RunEventType.VariableValueChanges, changes };
          }),
          startWith<RunEvent>({
            type: RunEventType.NodeAugmentChange,
            nodeId: nodeConfig.nodeId,
            augmentChange: { isRunning: true },
          }),
          endWith<RunEvent>({
            type: RunEventType.NodeAugmentChange,
            nodeId: nodeConfig.nodeId,
            augmentChange: { isRunning: false },
          }),
          // `catchError` here act like `endWith`, but also make sure the error
          // is rethrown.
          //
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          catchError<any, Observable<RunEvent>>((e) =>
            concat<[RunEvent, RunEvent]>(
              of({
                type: RunEventType.NodeAugmentChange,
                nodeId: nodeConfig.nodeId,
                augmentChange: { isRunning: false, hasError: true },
              }),
              throwError(() => e),
            ),
          ),
        );
      });

      return from(obsList).pipe(
        // Switch to mergeAll to subscribe to each observable at the same time,
        // to maximize the concurrency.
        concatAll(),
        tap({
          error(error) {
            // console.error("Run failed with error,", e);
            // By erroring `signalSubject`, we error the observable chain
            // immediately.
            signalSubject.error(error);
          },
          complete() {
            signalSubject.next();
          },
        }),
      );
    }),
    catchError((error) =>
      of<RunStatusChangeEvent>({ type: RunEventType.RunStatusChange, error }),
    ),
  );
}

type ArgumentsCreateTopologicalSortNodeConfigListObservable = {
  signalSubject: Subject<void>;
  nodeConfigsDict: Readonly<V3NodeConfigsDict>;
  edges: ReadonlyArray<V3ServerEdge>;
};

/**
 * - Create an observable that emits a list of NodeConfig in topological order.
 * - Every time `signalSubject` emits a signal, the observable will emit a new
 *   list.
 * - The list of NodeConfig won't have any dependencies among them. So they can
 *   be handled at the same time.
 */
function createTopologicalSortNodeConfigListObservable({
  signalSubject,
  nodeConfigsDict,
  edges,
}: ArgumentsCreateTopologicalSortNodeConfigListObservable): Observable<
  V3NodeConfig[]
> {
  return defer(() => {
    // SECTION: Initialize graph related objects
    const nodeGraph: Record<NodeID, NodeID[]> = {};
    const nodeIndegree: Record<NodeID, number> = {};

    for (const nodeId of D.keys(nodeConfigsDict)) {
      nodeGraph[nodeId] = [];
      nodeIndegree[nodeId] = 0;
    }
    // !SECTION

    // SECTION: Build graph
    for (const edge of edges) {
      // `nodeGraph[edge.source]` will contain duplicate edge.target,
      // because there can be multiple edges between two nodes.
      // We must reduce indegree equal number of times in the while loop below.
      nodeGraph[edge.source]!.push(edge.target);
      nodeIndegree[edge.target] += 1;
    }
    // !SECTION

    // SECTION: Create iniial group of nodes with indegree 0.
    let group: NodeID[] = [];

    for (const [key, count] of Object.entries(nodeIndegree)) {
      const nodeId = key as NodeID;
      if (count === 0) {
        group.push(nodeId);
      }
    }
    // !SECTION

    return signalSubject.pipe(
      map<void, V3NodeConfig[]>(() => {
        const nextGroup: NodeID[] = [];

        for (const nodeId of group) {
          for (const nextId of nodeGraph[nodeId]!) {
            nodeIndegree[nextId] -= 1;
            if (nodeIndegree[nextId] === 0) {
              nextGroup.push(nextId);
            }
          }
        }

        const nodeConfigList = group.map((nodeId) => nodeConfigsDict[nodeId]!);
        group = nextGroup;
        return nodeConfigList;
      }),
    );
  });
}

type ArgumentsCreateNodeConfigExecutionObservable = {
  nodeConfig: V3NodeConfig;
  context: {
    variablesDict: VariablesDict;
    edgeTargetHandleToSourceHandleLookUpDict: Record<
      V3VariableID,
      V3VariableID
    >;
    outputIdToValueMap: V3VariableValueLookUpDict;
    useStreaming: boolean;
  };
};

function createNodeConfigExecutionObservable({
  nodeConfig,
  context: {
    variablesDict,
    edgeTargetHandleToSourceHandleLookUpDict,
    outputIdToValueMap,
    useStreaming,
  },
}: ArgumentsCreateNodeConfigExecutionObservable): Observable<V3VariableValueLookUpDict> {
  switch (nodeConfig.type) {
    case NodeType.InputNode:
      return EMPTY;
    case NodeType.OutputNode:
      return handleOutputNode(
        nodeConfig,
        variablesDict,
        edgeTargetHandleToSourceHandleLookUpDict,
        outputIdToValueMap,
      );
    case NodeType.JavaScriptFunctionNode:
      return handleJavaScriptFunctionNode(
        nodeConfig,
        variablesDict,
        edgeTargetHandleToSourceHandleLookUpDict,
        outputIdToValueMap,
      );
    case NodeType.ChatGPTMessageNode:
      return handleChatGPTMessageNode(
        nodeConfig,
        variablesDict,
        edgeTargetHandleToSourceHandleLookUpDict,
        outputIdToValueMap,
      );
    case NodeType.ChatGPTChatCompletionNode:
      return handleChatGPTChatNode(
        nodeConfig,
        variablesDict,
        edgeTargetHandleToSourceHandleLookUpDict,
        outputIdToValueMap,
        useStreaming,
      );
    case NodeType.TextTemplate:
      return handleTextTemplateNode(
        nodeConfig,
        variablesDict,
        edgeTargetHandleToSourceHandleLookUpDict,
        outputIdToValueMap,
      );
    case NodeType.HuggingFaceInference:
      return handleHuggingFaceInferenceNode(
        nodeConfig,
        variablesDict,
        edgeTargetHandleToSourceHandleLookUpDict,
        outputIdToValueMap,
      );
    case NodeType.ElevenLabs:
      return handleElevenLabsNode(
        nodeConfig,
        variablesDict,
        edgeTargetHandleToSourceHandleLookUpDict,
        outputIdToValueMap,
      );
  }
}