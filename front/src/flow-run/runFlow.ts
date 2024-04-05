import { A, D, pipe } from '@mobily/ts-belt';
import { produce } from 'immer';
import {
  BehaviorSubject,
  Observable,
  catchError,
  concatAll,
  ignoreElements,
  map,
  materialize,
  mergeMap,
  of,
  tap,
  type Observer,
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
  NodeClass,
  NodeExecutionConfig,
  NodeExecutionContext,
  NodeExecutionParams,
  NodeInputVariable,
  NodeType,
  getNodeDefinitionForNodeTypeName,
  type RunNodeResult,
} from 'flow-models';

import {
  RunNodeProgressEventType,
  type RunFlowResult,
  type RunNodeProgressEvent,
} from './event-types';

type Params = {
  nodeConfigs: Readonly<Record<string, NodeAllLevelConfigUnion>>;
  connectors: Readonly<Record<string, Connector>>;
  inputValueMap: Readonly<Record<string, Readonly<unknown>>>;
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

  let allVariableValues = { ...params.inputValueMap };
  // Track when to complete the observable.
  let queuedNodeCount = initialNodeIdList.length;

  const nodeIdListSubject = new BehaviorSubject<string[]>(initialNodeIdList);

  return nodeIdListSubject.pipe(
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
        const nodeInputVariableValues: ConnectorResultMap = {};

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

        let runNodeResult: RunNodeResult = {
          errors: [],
          connectorResults: {},
          completedConnectorIds: [],
        };

        params.progressObserver.next({
          type: RunNodeProgressEventType.Started,
          nodeId: nodeId,
        });

        // ANCHOR: Execute
        return runNode(
          nodeExecutionContext,
          nodeExecutionConfig,
          nodeExecutionParams,
        ).pipe(
          // Handle uncaught error and convert it into RunNodeResult
          catchError<RunNodeResult, Observable<RunNodeResult>>((err) => {
            console.error(err);

            nodeIdListSubject.complete();

            return of({
              errors: [JSON.stringify(err)],
              connectorResults: {},
              completedConnectorIds: [],
            });
          }),
          map((result) => {
            runNodeResult = mergeRunNodeResult(runNodeResult, result);
            return runNodeResult;
          }),
          materialize(),
          tap((event) => {
            if (event.kind === 'N') {
              // Update `allVariableValueMap` with values from node
              // execution outputs.
              allVariableValues = produce(allVariableValues, (draft) => {
                const pairs = D.toPairs(event.value.connectorResults);

                for (const [connectorId, result] of pairs) {
                  const connector = params.connectors[connectorId];

                  if (
                    (connector.type === ConnectorType.NodeInput ||
                      connector.type === ConnectorType.NodeOutput) &&
                    connector.isGlobal &&
                    connector.globalVariableId != null
                  ) {
                    draft[connector.globalVariableId] = result;
                  } else {
                    draft[connectorId] = result;
                  }
                }
              });

              params.progressObserver.next({
                type: RunNodeProgressEventType.Updated,
                nodeId: nodeId,
                result: event.value,
              });
            } else if (event.kind === 'C') {
              // Make a copy
              let finishedConnectorIds =
                runNodeResult.completedConnectorIds.slice();

              // TODO: Generalize this for all node types
              if (params.nodeConfigs[nodeId].type !== NodeType.ConditionNode) {
                // NOTE: For non-ConditionNode, we need to add the regular
                // outgoing condition to the finishedConnectorIds list manually.
                const regularOutgoingCondition = D.values(
                  params.connectors,
                ).find(
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

              params.progressObserver.next({
                type: RunNodeProgressEventType.Finished,
                nodeId: nodeConfig.nodeId,
              });
            } else {
              // TODO: Report to telemetry
              throw event.error;
            }
          }),
          ignoreElements(),
        );
      });
    }),
    // NOTE: Switch from concatAll() to mergeAll() to subscribe to each
    // observable at the same time to maximize the concurrency.
    concatAll(),
    materialize(),
    map((event) => {
      invariant(event.kind === 'C', 'event kind is complete');
      return { variableResults: allVariableValues };
    }),
  );
}

function mergeRunNodeResult(
  original: Readonly<RunNodeResult>,
  override: Readonly<RunNodeResult>,
): RunNodeResult {
  return {
    errors: [...original.errors, ...override.errors],
    connectorResults: {
      ...original.connectorResults,
      ...override.connectorResults,
    },
    completedConnectorIds: Array.from(
      new Set([
        ...original.completedConnectorIds,
        ...override.completedConnectorIds,
      ]),
    ),
  };
}

export default runFlow;
