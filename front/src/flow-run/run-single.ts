import { D } from '@mobily/ts-belt';
import {
  NodeExecutionEvent,
  NodeExecutionEventType,
  NodeID,
  V3FlowContent,
  V3NodeConfig,
  V3NodeConfigsDict,
  V3ServerEdge,
  V3VariableID,
  V3VariableValueLookUpDict,
  getNodeDefinitionForNodeTypeName,
} from 'flow-models';
import {
  BehaviorSubject,
  EMPTY,
  Observable,
  Subject,
  catchError,
  concatAll,
  defer,
  from,
  map,
  mergeMap,
  of,
  tap,
} from 'rxjs';
import { useLocalStorageStore } from '../state/appState';

export function runSingle({
  flowContent,
  inputVariableMap,
  useStreaming = false,
}: {
  flowContent: Readonly<V3FlowContent>;
  inputVariableMap: Readonly<V3VariableValueLookUpDict>;
  useStreaming?: boolean;
}): Observable<NodeExecutionEvent> {
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
  ): Observable<NodeExecutionEvent> {
    if (listOfNodeConfigs.length === 0) {
      // Completing the `signalSubject` will complete the observable after
      // the returned observable is completed.
      signalSubject.complete();
      return EMPTY;
    }

    const obsList = listOfNodeConfigs.map(
      (nodeConfig): Observable<NodeExecutionEvent> => {
        return getNodeDefinitionForNodeTypeName(nodeConfig.type)
          .createNodeExecutionObservable(nodeConfig, {
            variablesDict,
            edgeTargetHandleToSourceHandleLookUpDict,
            outputIdToValueMap,
            useStreaming,
            openAiApiKey: useLocalStorageStore.getState().openAiApiKey,
            huggingFaceApiToken:
              useLocalStorageStore.getState().huggingFaceApiToken,
            elevenLabsApiKey: useLocalStorageStore.getState().elevenLabsApiKey,
          })
          .pipe(
            // NOTE: Expected errors from the observable will be emitted as
            // NodeExecutionEventType.Errors event.
            //
            // For unexpected errors, we will convert that to
            // NodeExecutionEventType.Errors.
            //
            // Always end with NodeExecutionEventType.Finish event per
            // expectation.
            catchError<NodeExecutionEvent, Observable<NodeExecutionEvent>>(
              (err) => {
                signalSubject.complete();

                return of<NodeExecutionEvent[]>(
                  {
                    type: NodeExecutionEventType.Errors,
                    nodeId: nodeConfig.nodeId,
                    errMessages: [JSON.stringify(err)],
                  },
                  {
                    type: NodeExecutionEventType.Finish,
                    nodeId: nodeConfig.nodeId,
                    finishedConnectorIds: [],
                  },
                );
              },
            ),
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
  }).pipe(
    mergeMap<V3NodeConfig[], Observable<NodeExecutionEvent>>(
      handleNodeConfigList,
    ),
  );
}

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
}: {
  signalSubject: Subject<void>;
  nodeConfigsDict: Readonly<V3NodeConfigsDict>;
  edges: ReadonlyArray<V3ServerEdge>;
}): Observable<V3NodeConfig[]> {
  return defer(() => {
    // ANCHOR: Initialize graph related objects

    const nodeGraph: Record<NodeID, NodeID[]> = {};
    const nodeIndegree: Record<NodeID, number> = {};

    for (const nodeId of D.keys(nodeConfigsDict)) {
      nodeGraph[nodeId] = [];
      nodeIndegree[nodeId] = 0;
    }

    // ANCHOR: Build graph

    for (const edge of edges) {
      // `nodeGraph[edge.source]` will contain duplicate edge.target,
      // because there can be multiple edges between two nodes.
      // We must reduce indegree equal number of times in the while loop below.
      nodeGraph[edge.source]!.push(edge.target);
      nodeIndegree[edge.target] += 1;
    }

    // ANCHOR: Create iniial group of nodes with indegree 0.

    let group: NodeID[] = [];

    for (const [key, count] of Object.entries(nodeIndegree)) {
      const nodeId = key as NodeID;
      if (count === 0) {
        group.push(nodeId);
      }
    }

    // ANCHOR: Create observable

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
