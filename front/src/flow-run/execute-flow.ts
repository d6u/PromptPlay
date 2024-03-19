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
  Condition,
  Connector,
  ConnectorResultMap,
  ConnectorType,
  CreateNodeExecutionObservableFunction,
  ImmutableFlowNodeGraph,
  NodeAllLevelConfigUnion,
  NodeExecutionConfig,
  NodeExecutionContext,
  NodeExecutionEvent,
  NodeExecutionEventType,
  NodeExecutionParams,
  NodeInputVariable,
  NodeType,
  getNodeDefinitionForNodeTypeName,
} from 'flow-models';

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

            const nodeConnectors = pipe(
              params.connectors,
              D.values,
              A.filter((connector) => connector.nodeId === nodeConfig.nodeId),
            );

            const nodeExecutionConfig: NodeExecutionConfig<NodeAllLevelConfigUnion> =
              {
                nodeConfig,
                connectorList: nodeConnectors,
              };

            // ANCHOR: NodeExecutionParams

            // TODO: We need to emit the NodeInput variable value to store
            // as well, otherwise we cannot inspect node input variable values.
            // Currently, we only emit NodeOutput variable values or
            // OutputNode's NodeInput variable values.

            const nodeInputValueMap: ConnectorResultMap = {};

            if (nodeConfig.type === NodeType.InputNode) {
              nodeConnectors.forEach((connector) => {
                nodeInputValueMap[connector.id] =
                  allVariableValueMap[connector.id];
              });
            } else {
              nodeConnectors
                .filter(
                  (conn): conn is NodeInputVariable =>
                    conn.type === ConnectorType.NodeInput,
                )
                .forEach((variable) => {
                  if (variable.isGlobal) {
                    if (variable.globalVariableId != null) {
                      nodeInputValueMap[variable.id] =
                        allVariableValueMap[variable.globalVariableId];
                    }
                  } else {
                    const sourceVariableId =
                      mutableFlowGraph.getSrcVariableIdFromDstVariableId(
                        variable.id,
                      );

                    nodeInputValueMap[variable.id] =
                      allVariableValueMap[sourceVariableId];
                  }
                });
            }

            const nodeExecutionParams: NodeExecutionParams = {
              nodeInputValueMap,
              useStreaming: params.preferStreaming,
            };

            // ANCHOR: Execute

            return execute(
              nodeExecutionContext,
              nodeExecutionConfig,
              nodeExecutionParams,
            ).pipe(
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
                const connector = params.connectors[id];

                if (
                  (connector.type === ConnectorType.NodeInput ||
                    connector.type === ConnectorType.NodeOutput) &&
                  connector.isGlobal &&
                  connector.globalVariableId != null
                ) {
                  draft[connector.globalVariableId] = value;
                } else {
                  draft[id] = value;
                }
              }),
            );
          });
        } else if (event.type === NodeExecutionEventType.Finish) {
          // Make a copy
          const finishedConnectorIds = event.finishedConnectorIds.slice();

          // TODO: Generalize this for all node types
          if (
            params.nodeConfigs[event.nodeId].type !== NodeType.ConditionNode
          ) {
            // NOTE: For non-ConditionNode, we need to add the regular
            // outgoing condition to the finishedConnectorIds list manually.
            const regularOutgoingCondition = D.values(params.connectors).find(
              (connector): connector is Condition =>
                connector.nodeId === event.nodeId &&
                connector.type === ConnectorType.Condition,
            );

            if (regularOutgoingCondition != null) {
              finishedConnectorIds.push(regularOutgoingCondition.id);
            }
          }

          const nextNodeIdList =
            mutableFlowGraph.reduceNodeIndegrees(finishedConnectorIds);

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
