import { D } from '@mobily/ts-belt';
import {
  NodeExecutionEvent,
  NodeExecutionEventType,
  NodeID,
  V3FlowContent,
  V3VariableID,
  V3VariableValueLookUpDict,
  VariableType,
  getNodeDefinitionForNodeTypeName,
} from 'flow-models';
import {
  BehaviorSubject,
  EMPTY,
  Observable,
  catchError,
  concatAll,
  from,
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

  // ANCHOR: Prepare initial input values

  // NOTE: Copy object to avoid mutation.
  const sourceIdToValueMap: V3VariableValueLookUpDict = { ...inputVariableMap };

  // ANCHOR: Create ID maps for easy lookup

  // NOTE: `sourceConnectorIdToTargetNodeIdMap` value is an array because
  // one source connector can be connected to multiple target nodes.
  const sourceConnectorIdToTargetNodeIdMap: Record<V3VariableID, NodeID[]> = {};

  const targetConnectorIdToSourceConnectorIdMap: Record<
    V3VariableID,
    V3VariableID
  > = {};

  for (const edge of edges) {
    if (sourceConnectorIdToTargetNodeIdMap[edge.sourceHandle] == null) {
      sourceConnectorIdToTargetNodeIdMap[edge.sourceHandle] = [];
    }
    sourceConnectorIdToTargetNodeIdMap[edge.sourceHandle].push(edge.target);

    const connector = variablesDict[edge.sourceHandle];
    // NOTE: We only need to map variable IDs.
    // Condition IDs are not mappable because one target ID can be connected to
    // multiple source IDs.
    if (
      connector.type === VariableType.FlowInput ||
      connector.type === VariableType.NodeOutput
    ) {
      targetConnectorIdToSourceConnectorIdMap[edge.targetHandle] =
        edge.sourceHandle;
    }
  }

  console.table(sourceConnectorIdToTargetNodeIdMap);

  // ANCHOR: Initialize graph related objects

  const nodeGraph: Record<NodeID, NodeID[]> = {};
  const nodeIndegree: Record<NodeID, number> = {};

  for (const nodeId of D.keys(nodeConfigsDict)) {
    nodeGraph[nodeId] = [];
    nodeIndegree[nodeId] = 0;
  }

  // ANCHOR: Build graph

  for (const edge of edges) {
    // NOTE: `nodeGraph[edge.source]` will contain duplicate edge.target,
    // because there can be multiple edges between two nodes.
    // We must reduce indegree equal number of times in the while loop below.
    nodeGraph[edge.source]!.push(edge.target);
    nodeIndegree[edge.target] += 1;
  }

  console.table(nodeIndegree);

  // ANCHOR: Create group of nodes with indegree 0.

  const initialListOfNodeIds: NodeID[] = [];

  // NOTE: We are mutating `nodeIndegree` here.
  for (const [nodeId, count] of Object.entries(nodeIndegree)) {
    if (count === 0) {
      initialListOfNodeIds.push(nodeId as NodeID);
    }
  }

  // NOTE: `listOfNodeIdsSubject` will node IDs in topological order.
  const listOfNodeIdsSubject = new BehaviorSubject<NodeID[]>(
    initialListOfNodeIds,
  );

  return listOfNodeIdsSubject.pipe(
    mergeMap((nodeIds) => {
      if (nodeIds.length === 0) {
        listOfNodeIdsSubject.complete();
        return EMPTY;
      }

      const listOfExecutionObs = nodeIds
        .map((nodeId) => nodeConfigsDict[nodeId])
        .map((nodeConfig) => {
          const nodeDefinition = getNodeDefinitionForNodeTypeName(
            nodeConfig.type,
          );

          const executionObs = nodeDefinition.createNodeExecutionObservable(
            nodeConfig,
            {
              variablesDict,
              targetConnectorIdToSourceConnectorIdMap,
              sourceIdToValueMap,
              useStreaming,
              openAiApiKey: useLocalStorageStore.getState().openAiApiKey,
              huggingFaceApiToken:
                useLocalStorageStore.getState().huggingFaceApiToken,
              elevenLabsApiKey:
                useLocalStorageStore.getState().elevenLabsApiKey,
            },
          );

          executionObs.pipe(
            catchError<NodeExecutionEvent, Observable<NodeExecutionEvent>>(
              (err) => {
                // NOTE: Expected errors from the observable will be emitted as
                // NodeExecutionEventType.Errors event.
                //
                // For unexpected errors, we will convert that to
                // NodeExecutionEventType.Errors.
                //
                // Always end with NodeExecutionEventType.Finish event per
                // expectation.
                listOfNodeIdsSubject.complete();

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

          return executionObs;
        });

      return from(listOfExecutionObs);
    }),
    // NOTE: Switch from concatAll() to mergeAll() to subscribe to each
    // observable at the same time to maximize the concurrency.
    concatAll(),
    tap((event) => {
      if (event.type === NodeExecutionEventType.Finish) {
        const nextListOfNodeIds: NodeID[] = [];

        for (const finishedConnectorId of event.finishedConnectorIds) {
          // NOTE: `finishedConnectorIds` might contain source connector
          // that is not connected by a edge.
          const targetNodeIds = sourceConnectorIdToTargetNodeIdMap[
            finishedConnectorId
          ] as NodeID[] | undefined;

          if (targetNodeIds != null) {
            for (const targetNodeId of targetNodeIds) {
              nodeIndegree[targetNodeId] -= 1;

              if (nodeIndegree[targetNodeId] === 0) {
                nextListOfNodeIds.push(targetNodeId);
              }
            }
          }
        }

        listOfNodeIdsSubject.next(nextListOfNodeIds);
      }
    }),
  );
}
