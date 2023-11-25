import { D } from "@mobily/ts-belt";
import {
  BehaviorSubject,
  catchError,
  concat,
  concatMap,
  EMPTY,
  endWith,
  from,
  map,
  Observable,
  of,
  startWith,
  tap,
  throwError,
  zipWith,
} from "rxjs";
import invariant from "ts-invariant";
import { NodeID, NodeType } from "../models/v2-flow-content-types";
import {
  V3FlowContent,
  V3NodeConfig,
  V3NodeConfigsDict,
  V3ServerEdge,
  V3VariableID,
  V3VariableValueLookUpDict,
} from "../models/v3-flow-content-types";
import { handleChatGPTChatNode } from "./handleChatGPTChatNode";
import { handleChatGPTMessageNode } from "./handleChatGPTMessageNode";
import { handleElevenLabsNode } from "./handleElevenLabsNode";
import { handleHuggingFaceInferenceNode } from "./handleHuggingFaceInferenceNode";
import { handleJavaScriptFunctionNode } from "./handleJavaScriptFunctionNode";
import { handleOutputNode } from "./handleOutputNode";
import { handleTextTemplateNode } from "./handleTextTemplateNode";
import {
  FlowInputVariableMap,
  RunEvent,
  RunEventType,
  RunStatusChangeEvent,
} from "./run-types";

export const AsyncFunction = async function () {}.constructor;

type Arguments = {
  flowContent: Readonly<V3FlowContent>;
  inputVariableMap: Readonly<FlowInputVariableMap>;
  useStreaming?: boolean;
};

export function runSingle({
  flowContent,
  inputVariableMap,
  useStreaming = false,
}: Arguments): Observable<RunEvent> {
  const { nodeConfigsDict, edges, variablesDict } = flowContent;

  const outputIdToValueMap: FlowInputVariableMap = { ...inputVariableMap };
  const edgeTargetHandleToSourceHandleLookUpDict: Record<
    V3VariableID,
    V3VariableID
  > = {};

  for (const edge of edges) {
    edgeTargetHandleToSourceHandleLookUpDict[edge.targetHandle] =
      edge.sourceHandle!;
  }

  // `sub` is to control the pace of the execution and the termination.
  //
  // Because the observable below will emit all the nodes at once, we give `sub`
  // a value one at a time and only give `sub` a new value after one node in
  // the observable is finished executing. So that we can execute the node graph
  // in topological order.
  const sub = new BehaviorSubject(0);

  return createTopologicalSortNodeConfigObservable(nodeConfigsDict, edges).pipe(
    zipWith(sub),
    concatMap(([{ nodeId, nodeConfig }]) => {
      let obs1: Observable<V3VariableValueLookUpDict>;

      switch (nodeConfig.type) {
        case NodeType.InputNode: {
          obs1 = EMPTY;
          break;
        }
        case NodeType.OutputNode: {
          obs1 = handleOutputNode(
            nodeConfig,
            variablesDict,
            edgeTargetHandleToSourceHandleLookUpDict,
            outputIdToValueMap,
          );
          break;
        }
        case NodeType.JavaScriptFunctionNode: {
          const nodeData = nodeConfig;
          obs1 = handleJavaScriptFunctionNode(
            nodeData,
            variablesDict,
            edgeTargetHandleToSourceHandleLookUpDict,
            outputIdToValueMap,
          );
          break;
        }
        case NodeType.ChatGPTMessageNode: {
          obs1 = handleChatGPTMessageNode(
            nodeConfig,
            variablesDict,
            edgeTargetHandleToSourceHandleLookUpDict,
            outputIdToValueMap,
          );
          break;
        }
        case NodeType.ChatGPTChatCompletionNode: {
          obs1 = from(
            handleChatGPTChatNode(
              nodeConfig,
              variablesDict,
              edgeTargetHandleToSourceHandleLookUpDict,
              outputIdToValueMap,
              useStreaming,
            ),
          );
          break;
        }
        case NodeType.TextTemplate: {
          obs1 = handleTextTemplateNode(
            nodeConfig,
            variablesDict,
            edgeTargetHandleToSourceHandleLookUpDict,
            outputIdToValueMap,
          );
          break;
        }
        case NodeType.HuggingFaceInference: {
          obs1 = handleHuggingFaceInferenceNode(
            nodeConfig,
            variablesDict,
            edgeTargetHandleToSourceHandleLookUpDict,
            outputIdToValueMap,
          );
          break;
        }
        case NodeType.ElevenLabs: {
          obs1 = handleElevenLabsNode(
            nodeConfig,
            variablesDict,
            edgeTargetHandleToSourceHandleLookUpDict,
            outputIdToValueMap,
          );
          break;
        }
      }

      return obs1.pipe(
        // startWith and endWith will run for each node, before and after
        // running its logic.
        map<V3VariableValueLookUpDict, RunEvent>((changes) => {
          return { type: RunEventType.VariableValueChanges, changes };
        }),
        startWith<RunEvent>({
          type: RunEventType.NodeAugmentChange,
          nodeId,
          augmentChange: { isRunning: true },
        }),
        endWith<RunEvent>({
          type: RunEventType.NodeAugmentChange,
          nodeId,
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
              nodeId,
              augmentChange: { isRunning: false, hasError: true },
            }),
            throwError(() => e),
          ),
        ),
        tap({
          complete() {
            sub.next(0);
          },
        }),
      );
    }),
    tap({
      error(e) {
        // console.error("Run failed with error,", e);
        // By erroring `sub`, we stop the observable chain completely.
        sub.error(e);
      },
      complete() {
        sub.complete();
      },
    }),
    catchError((error) =>
      of<RunStatusChangeEvent>({ type: RunEventType.RunStatusChange, error }),
    ),
  );
}

function createTopologicalSortNodeConfigObservable(
  nodeConfigsDict: V3NodeConfigsDict,
  edges: V3ServerEdge[],
) {
  return new Observable<{ nodeId: NodeID; nodeConfig: V3NodeConfig }>(
    (subscriber) => {
      // SECTION: Initialize graph related objects
      const nodeGraph: Record<NodeID, NodeID[]> = {};
      const nodeIndegree: Record<NodeID, number> = {};

      for (const nodeId of D.keys(nodeConfigsDict)) {
        nodeGraph[nodeId] = [];
        nodeIndegree[nodeId] = 0;
      }
      // !SECTION
      // SECTION: Build basic information about graph
      for (const edge of edges) {
        // `nodeGraph[edge.source]` will contain duplicate edge.target,
        // because there can be multiple edges between two nodes.
        // We must reduce indegree equal number of times in the while loop below.
        nodeGraph[edge.source]!.push(edge.target);
        nodeIndegree[edge.target] += 1;
      }
      // !SECTION
      // Topological sort of the node graph.
      const queue: NodeID[] = [];

      for (const [key, count] of Object.entries(nodeIndegree)) {
        const nodeId = key as NodeID;
        if (count === 0) {
          queue.push(nodeId);
        }
      }

      while (queue.length > 0) {
        const nodeId = queue.shift()!;
        const nodeConfig = nodeConfigsDict[nodeId];
        invariant(nodeConfig != null);

        subscriber.next({ nodeId, nodeConfig });

        for (const nextId of nodeGraph[nodeId]!) {
          nodeIndegree[nextId] -= 1;
          if (nodeIndegree[nextId] === 0) {
            queue.push(nextId);
          }
        }
      }

      subscriber.complete();
    },
  );
}
