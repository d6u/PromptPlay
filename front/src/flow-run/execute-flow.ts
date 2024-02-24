import { A, D, pipe } from '@mobily/ts-belt';
import { produce } from 'immer';
import {
  BehaviorSubject,
  Observable,
  catchError,
  concatAll,
  defer,
  mergeMap,
  of,
  tap,
} from 'rxjs';
import invariant from 'tiny-invariant';

import {
  Connector,
  ConnectorMap,
  ConnectorResultMap,
  ConnectorType,
  CreateNodeExecutionObservableFunction,
  FlowOutputVariable,
  GraphEdge,
  ImmutableFlowNodeGraph,
  NodeAllLevelConfigUnion,
  NodeConfigMap,
  NodeExecutionConfig,
  NodeExecutionContext,
  NodeExecutionEvent,
  NodeExecutionEventType,
  NodeExecutionParams,
  NodeInputVariable,
  NodeType,
  getNodeDefinitionForNodeTypeName,
} from 'flow-models';

export type FlowConfig = {
  edgeList: GraphEdge[];
  nodeConfigMap: NodeConfigMap;
  connectorMap: ConnectorMap;
};

export const executeFlow = (params: {
  nodeConfigs: Readonly<Record<string, NodeAllLevelConfigUnion>>;
  connectors: Readonly<Record<string, Connector>>;
  inputValueMap: Readonly<Record<string, unknown>>;
  preferStreaming: boolean;
  flowGraph: ImmutableFlowNodeGraph;
}): Observable<NodeExecutionEvent> => {
  return defer((): Observable<NodeExecutionEvent> => {
    const mutableFlowGraph = params.flowGraph.getMutableCopy();
    const initialNodeIdList = mutableFlowGraph.getNodeIdListWithIndegreeZero();

    invariant(initialNodeIdList.length > 0, 'initialNodeIdList is not empty');

    let allVariableValueMap = { ...params.inputValueMap };
    // Track when to complete the observable.
    let queuedNodeCount = initialNodeIdList.length;

    const nodeIdListSubject = new BehaviorSubject<string[]>(initialNodeIdList);

    return nodeIdListSubject.pipe(
      // mergeMap converts ArrayLike to Observable automatically
      mergeMap((nodeIdList): Observable<NodeExecutionEvent>[] => {
        return pipe(
          nodeIdList,
          A.map((nodeId) => params.nodeConfigs[nodeId]),
          A.map((nodeConfig): Observable<NodeExecutionEvent> => {
            const nodeDefinition = getNodeDefinitionForNodeTypeName(
              nodeConfig.type,
            );

            // `createNodeExecutionObservable` is a union type like this:
            //
            // ```
            // | CreateNodeExecutionObservableFunction<InputNodeInstanceLevelConfig>
            // | CreateNodeExecutionObservableFunction<OutputNodeInstanceLevelConfig>
            // | ...
            // ```
            //
            // this will deduce the argument type of
            // `createNodeExecutionObservable` to never when called.
            // Cast it to a more flexible type to avoid this issue.
            const execute =
              nodeDefinition.createNodeExecutionObservable as CreateNodeExecutionObservableFunction<NodeAllLevelConfigUnion>;

            // ANCHOR: Context

            const nodeExecutionContext = new NodeExecutionContext(
              mutableFlowGraph,
            );

            // ANCHOR: NodeExecutionConfig

            const connectorList = pipe(
              params.connectors,
              D.values,
              A.filter((connector) => connector.nodeId === nodeConfig.nodeId),
            );

            const config: NodeExecutionConfig<NodeAllLevelConfigUnion> = {
              nodeConfig,
              connectorList,
            };

            // ANCHOR: NodeExecutionParams

            const nodeInputValueMap: ConnectorResultMap = {};

            if (nodeConfig.type === NodeType.InputNode) {
              connectorList.forEach((connector) => {
                nodeInputValueMap[connector.id] =
                  allVariableValueMap[connector.id];
              });
            } else {
              connectorList
                .filter(
                  (conn): conn is FlowOutputVariable | NodeInputVariable =>
                    conn.type === ConnectorType.NodeInput ||
                    conn.type === ConnectorType.FlowOutput,
                )
                .forEach((connector) => {
                  const srcConnectorId =
                    mutableFlowGraph.getSrcConnectorIdFromDstConnectorId(
                      connector.id,
                    );
                  nodeInputValueMap[connector.id] =
                    allVariableValueMap[srcConnectorId];
                });
            }

            const executeParams: NodeExecutionParams = {
              nodeInputValueMap,
              useStreaming: params.preferStreaming,
            };

            // ANCHOR: Execute

            return execute(nodeExecutionContext, config, executeParams).pipe(
              catchError<NodeExecutionEvent, Observable<NodeExecutionEvent>>(
                (err) => {
                  // The observable will emit soft errors as
                  // NodeExecutionEventType.Errors event.
                  //
                  // This callback is for handling interruptive errors,
                  // we will convert them to
                  // NodeExecutionEventType.Errors and always end with
                  // NodeExecutionEventType.Finish event per expectation.

                  console.error(err);

                  nodeIdListSubject.complete();

                  return of<NodeExecutionEvent[]>(
                    {
                      type: NodeExecutionEventType.Errors,
                      nodeId: nodeConfig.nodeId,
                      errorMessages: [JSON.stringify(err)],
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
          }),
        );
      }),
      // NOTE: Switch from concatAll() to mergeAll() to subscribe to each
      // observable at the same time to maximize the concurrency.
      concatAll(),
      tap((event) => {
        if (event.type === NodeExecutionEventType.VariableValues) {
          // Update `allVariableValueMap` with values from node
          // execution outputs.
          allVariableValueMap = produce(allVariableValueMap, (draft) => {
            pipe(
              event.variableValuesLookUpDict,
              D.toPairs,
              A.forEach(([id, value]) => {
                draft[id] = value;
              }),
            );
          });
        } else if (event.type === NodeExecutionEventType.Finish) {
          const nextNodeIdList = mutableFlowGraph.reduceNodeIndegrees(
            event.finishedConnectorIds,
          );

          queuedNodeCount -= 1;

          if (nextNodeIdList.length === 0) {
            if (queuedNodeCount === 0) {
              nodeIdListSubject.complete();
            }
          } else {
            // Incrementing count on NodeExecutionEventType.Start event
            // won't work, because both `queuedNodeCount` and
            // `nextListOfNodeIds.length` could be 0 while there are still
            // values in `listOfNodeIdsSubject` waiting to be processed.
            //
            // I.e. `listOfNodeIdsSubject.complete()` will complete the subject
            // immediately, even though there are still values in the subject.

            queuedNodeCount += nextNodeIdList.length;

            nodeIdListSubject.next(nextNodeIdList);
          }
        }
      }),
    );
  });
};
