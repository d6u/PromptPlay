import { A, D, pipe } from '@mobily/ts-belt';
import { produce } from 'immer';
import {
  BehaviorSubject,
  EMPTY,
  Observable,
  catchError,
  concat,
  concatAll,
  defer,
  ignoreElements,
  mergeMap,
  of,
  tap,
  type Observer,
} from 'rxjs';
import invariant from 'tiny-invariant';

import {
  Connector,
  ConnectorResultRecords,
  ConnectorType,
  CreateNodeExecutionObservableFunction,
  ImmutableFlowNodeGraph,
  NodeAllLevelConfigUnion,
  NodeClass,
  NodeExecutionConfig,
  NodeExecutionContext,
  NodeExecutionParams,
  NodeInputVariable,
  NodeType,
  getNodeDefinitionForNodeTypeName,
  type Condition,
  type RunNodeResult,
  type VariableResultRecords,
} from 'flow-models';

import {
  RunNodeProgressEventType,
  type RunFlowResult,
  type RunNodeProgressEvent,
} from './event-types';

type Params = {
  nodeConfigs: Readonly<Record<string, NodeAllLevelConfigUnion>>;
  connectors: Readonly<Record<string, Connector>>;
  inputValueMap: VariableResultRecords;
  preferStreaming: boolean;
  flowGraph: ImmutableFlowNodeGraph;
  progressObserver: Observer<RunNodeProgressEvent>;
};

function runFlow(params: Params): Observable<RunFlowResult> {
  const mutableFlowGraph = params.flowGraph.getMutableCopy();
  const initialNodeIdList = mutableFlowGraph.getNodeIdListWithIndegreeZero();

  invariant(
    initialNodeIdList.length > 0,
    'initialNodeIdList should not be empty',
  );

  // Track when to complete the observable.
  let queuedNodeCount = initialNodeIdList.length;
  let allVariableValues: VariableResultRecords = { ...params.inputValueMap };

  const nodeIdListSubject = new BehaviorSubject<string[]>(initialNodeIdList);

  const obs1 = nodeIdListSubject.pipe(
    // mergeMap converts ArrayLike to Observable automatically
    mergeMap((nodeIdList): Observable<never>[] => {
      return nodeIdList.map((nodeId): Observable<never> => {
        const nodeConfig = params.nodeConfigs[nodeId];
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
        const runNode =
          nodeDefinition.createNodeExecutionObservable as CreateNodeExecutionObservableFunction<NodeAllLevelConfigUnion>;

        // ANCHOR: Context
        const nodeExecutionContext = new NodeExecutionContext(mutableFlowGraph);

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
        const nodeInputVariableValues: ConnectorResultRecords = {};

        if (nodeConfig.class === NodeClass.Start) {
          // When current node class is Start, we need to collect
          // NodeOutput variable values other than NodeInput variable
          // values.
          nodeConnectors.forEach((c) => {
            nodeInputVariableValues[c.id] = allVariableValues[c.id];
          });
        } else {
          // For non-Start node class, we need to collect NodeInput
          // variable values.
          nodeConnectors
            .filter(
              (c): c is NodeInputVariable => c.type === ConnectorType.NodeInput,
            )
            .forEach((variable) => {
              if (variable.isGlobal) {
                if (variable.globalVariableId != null) {
                  nodeInputVariableValues[variable.id] =
                    allVariableValues[variable.globalVariableId];
                }
              } else {
                const sourceVariableId =
                  mutableFlowGraph.getSrcVariableIdFromDstVariableId(
                    variable.id,
                  );

                nodeInputVariableValues[variable.id] =
                  allVariableValues[sourceVariableId];
              }
            });
        }

        const nodeExecutionParams: NodeExecutionParams = {
          nodeInputValueMap: nodeInputVariableValues,
          useStreaming: params.preferStreaming,
        };

        let allCompletedConnectorIds: string[] = [];

        params.progressObserver.next({
          type: RunNodeProgressEventType.Started,
          nodeId: nodeId,
        });

        // ANCHOR: Execute
        return concat(
          runNode(
            nodeExecutionContext,
            nodeExecutionConfig,
            nodeExecutionParams,
          ).pipe(
            catchError<RunNodeResult, Observable<RunNodeResult>>((err) => {
              console.error(err);

              nodeIdListSubject.complete();

              return of({ errors: [JSON.stringify(err)] });
            }),
            tap((result) => {
              params.progressObserver.next({
                type: RunNodeProgressEventType.Updated,
                nodeId: nodeId,
                result: result,
              });

              const { connectorResults, completedConnectorIds } = result;

              if (connectorResults != null) {
                allVariableValues = produce(allVariableValues, (draft) => {
                  const pairs = D.toPairs(connectorResults);

                  for (const [connectorId, result] of pairs) {
                    const connector = params.connectors[connectorId];

                    if (
                      (connector.type === ConnectorType.NodeInput ||
                        connector.type === ConnectorType.NodeOutput) &&
                      connector.isGlobal &&
                      connector.globalVariableId != null
                    ) {
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      draft[connector.globalVariableId] = result as any;
                    } else {
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      draft[connectorId] = result as any;
                    }
                  }
                });
              }

              if (completedConnectorIds != null) {
                allCompletedConnectorIds = Array.from(
                  new Set([
                    ...allCompletedConnectorIds,
                    ...completedConnectorIds,
                  ]),
                );
              }
            }),
            ignoreElements(),
          ),
          defer(() => {
            params.progressObserver.next({
              type: RunNodeProgressEventType.Finished,
              nodeId: nodeConfig.nodeId,
            });

            // Make a copy
            let finishedConnectorIds = allCompletedConnectorIds.slice();

            // TODO: Generalize this for all node types
            if (params.nodeConfigs[nodeId].type !== NodeType.ConditionNode) {
              // NOTE: For non-ConditionNode, we need to add the regular
              // outgoing condition to the finishedConnectorIds list manually.
              const regularOutgoingCondition = D.values(params.connectors).find(
                (connector): connector is Condition =>
                  connector.nodeId === nodeId &&
                  connector.type === ConnectorType.Condition,
              );

              if (regularOutgoingCondition != null) {
                finishedConnectorIds.push(regularOutgoingCondition.id);

                // Deduplicate
                finishedConnectorIds = [...new Set(finishedConnectorIds)];
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

            return EMPTY;
          }),
        );
      });
    }),
    // NOTE: Switch from concatAll() to mergeAll() to subscribe to each
    // observable at the same time to maximize the concurrency.
    concatAll(),
  );

  return concat(
    obs1,
    defer(() => {
      return of({ variableResults: allVariableValues });
    }),
  );
}

function mergeRunNodeResult(
  original: Readonly<Required<RunNodeResult>>,
  override: Readonly<RunNodeResult>,
): Required<RunNodeResult> {
  return {
    errors: override.errors
      ? [...original.errors, ...override.errors]
      : original.errors,
    connectorResults: {
      ...original.connectorResults,
      ...override.connectorResults,
    },
    completedConnectorIds: override.completedConnectorIds
      ? Array.from(
          new Set([
            ...original.completedConnectorIds,
            ...override.completedConnectorIds,
          ]),
        )
      : original.completedConnectorIds,
  };
}

export default runFlow;
