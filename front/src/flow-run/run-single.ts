import { D } from '@mobily/ts-belt';
import {
  CHATGPT_CHAT_COMPLETION_NODE_DEFINITION,
  CHATGPT_MESSAGE_NODE_DEFINITION,
  ELEVENLABS_NODE_DEFINITION,
  HUGGINGFACE_INFERENCE_NODE_DEFINITION,
  INPUT_NODE_DEFINITION,
  JAVASCRIPT_NODE_DEFINITION,
  NodeID,
  OUTPUT_NODE_DEFINITION,
  TEXT_TEMPLATE_NODE_DEFINITION,
  V3ChatGPTChatCompletionNodeConfig,
  V3ChatGPTMessageNodeConfig,
  V3ElevenLabsNodeConfig,
  V3FlowContent,
  V3HuggingFaceInferenceNodeConfig,
  V3JavaScriptFunctionNodeConfig,
  V3NodeConfig,
  V3NodeConfigsDict,
  V3OutputNodeConfig,
  V3ServerEdge,
  V3TextTemplateNodeConfig,
  V3VariableID,
  V3VariableValueLookUpDict,
  VariablesDict,
} from 'flow-models';
import {
  BehaviorSubject,
  EMPTY,
  Observable,
  Subject,
  catchError,
  concatAll,
  defer,
  endWith,
  from,
  map,
  mergeMap,
  of,
  startWith,
  tap,
} from 'rxjs';
import { handleChatGPTChatNode } from './handleChatGPTChatNode';
import { handleChatGPTMessageNode } from './handleChatGPTMessageNode';
import { handleElevenLabsNode } from './handleElevenLabsNode';
import { handleHuggingFaceInferenceNode } from './handleHuggingFaceInferenceNode';
import { handleJavaScriptFunctionNode } from './handleJavaScriptFunctionNode';
import { handleOutputNode } from './handleOutputNode';
import { handleTextTemplateNode } from './handleTextTemplateNode';
import { RunEvent, RunEventType } from './run-types';

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

  // `signalSubject` is to control the pace of the execution and the
  // termination.
  //
  // Because the observable below will emit all the nodes at once, we give
  // `signalSubject` a value one at a time and only give `signalSubject` a new
  // value after one node in the observable is finished executing. So that we
  // can execute the node graph in topological order.
  const signalSubject = new BehaviorSubject<void>(undefined);

  function handleNodeConfigList(
    listOfNodeConfigs: V3NodeConfig[],
  ): Observable<RunEvent> {
    if (listOfNodeConfigs.length === 0) {
      // Completing the `signalSubject` will complete the observable after
      // the returned observable is completed.
      signalSubject.complete();
      return EMPTY;
    }

    const obsList = listOfNodeConfigs.map<Observable<RunEvent>>(
      (nodeConfig) => {
        return createNodeConfigExecutionObservable({
          nodeConfig,
          context: {
            variablesDict,
            edgeTargetHandleToSourceHandleLookUpDict,
            outputIdToValueMap,
            useStreaming,
          },
        }).pipe(
          map<V3VariableValueLookUpDict, RunEvent>((changes) => ({
            type: RunEventType.VariableValueChanges,
            changes,
          })),
          startWith<RunEvent>({
            type: RunEventType.NodeStarted,
            nodeId: nodeConfig.nodeId,
          }),
          // Either `endWith` or `catchError` will be triggered but not both.
          endWith<RunEvent>({
            type: RunEventType.NodeFinished,
            nodeId: nodeConfig.nodeId,
          }),
          catchError<RunEvent, Observable<RunEvent>>((err) => {
            signalSubject.complete();
            return of({
              type: RunEventType.NodeError,
              nodeId: nodeConfig.nodeId,
              error: JSON.stringify(err),
            });
          }),
        );
      },
    );

    return from(obsList).pipe(
      // NOTE: Switch from concatAll() to mergeAll() to subscribe to each
      // observable at the same time to maximize the concurrency.
      concatAll(),
      tap({
        complete() {
          signalSubject.next();
        },
      }),
    );
  }

  return createTopologicalSortNodeConfigListObservable({
    signalSubject,
    nodeConfigsDict,
    edges,
  }).pipe(mergeMap<V3NodeConfig[], Observable<RunEvent>>(handleNodeConfigList));
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
    case INPUT_NODE_DEFINITION.nodeTypeName:
      return EMPTY;
    case OUTPUT_NODE_DEFINITION.nodeTypeName:
      return handleOutputNode(
        nodeConfig as V3OutputNodeConfig,
        variablesDict,
        edgeTargetHandleToSourceHandleLookUpDict,
        outputIdToValueMap,
      );
    case JAVASCRIPT_NODE_DEFINITION.nodeTypeName:
      return handleJavaScriptFunctionNode(
        nodeConfig as V3JavaScriptFunctionNodeConfig,
        variablesDict,
        edgeTargetHandleToSourceHandleLookUpDict,
        outputIdToValueMap,
      );
    case CHATGPT_MESSAGE_NODE_DEFINITION.nodeTypeName:
      return handleChatGPTMessageNode(
        nodeConfig as V3ChatGPTMessageNodeConfig,
        variablesDict,
        edgeTargetHandleToSourceHandleLookUpDict,
        outputIdToValueMap,
      );
    case CHATGPT_CHAT_COMPLETION_NODE_DEFINITION.nodeTypeName:
      return handleChatGPTChatNode(
        nodeConfig as V3ChatGPTChatCompletionNodeConfig,
        variablesDict,
        edgeTargetHandleToSourceHandleLookUpDict,
        outputIdToValueMap,
        useStreaming,
      );
    case TEXT_TEMPLATE_NODE_DEFINITION.nodeTypeName:
      return handleTextTemplateNode(
        nodeConfig as V3TextTemplateNodeConfig,
        variablesDict,
        edgeTargetHandleToSourceHandleLookUpDict,
        outputIdToValueMap,
      );
    case HUGGINGFACE_INFERENCE_NODE_DEFINITION.nodeTypeName:
      return handleHuggingFaceInferenceNode(
        nodeConfig as V3HuggingFaceInferenceNodeConfig,
        variablesDict,
        edgeTargetHandleToSourceHandleLookUpDict,
        outputIdToValueMap,
      );
    case ELEVENLABS_NODE_DEFINITION.nodeTypeName:
      return handleElevenLabsNode(
        nodeConfig as V3ElevenLabsNodeConfig,
        variablesDict,
        edgeTargetHandleToSourceHandleLookUpDict,
        outputIdToValueMap,
      );
    default:
      throw new Error(`Unknown node type: ${nodeConfig.type}`);
  }
}
