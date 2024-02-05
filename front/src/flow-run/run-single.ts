import { A, D, pipe } from '@mobily/ts-belt';
import { produce } from 'immer';
import {
  BehaviorSubject,
  EMPTY,
  Observable,
  catchError,
  concatAll,
  defer,
  from,
  mergeMap,
  of,
  tap,
} from 'rxjs';

import {
  ConnectorID,
  ConnectorMap,
  ConnectorResultMap,
  ConnectorType,
  CreateNodeExecutionObservableFunction,
  FlowExecutionContext,
  FlowOutputVariable,
  GraphEdge,
  NodeAllLevelConfigUnion,
  NodeConfig,
  NodeConfigMap,
  NodeExecutionConfig,
  NodeExecutionContext,
  NodeExecutionEvent,
  NodeExecutionEventType,
  NodeExecutionParams,
  NodeID,
  NodeInputVariable,
  NodeType,
  getNodeDefinitionForNodeTypeName,
} from 'flow-models';

import { useLocalStorageStore } from 'state-root/local-storage-state';

export type FlowConfig = {
  edgeList: GraphEdge[];
  nodeConfigMap: NodeConfigMap;
  connectorMap: ConnectorMap;
};

export type RunParams = {
  inputValueMap: ConnectorResultMap;
  useStreaming: boolean;
  openAiApiKey: string | null;
  huggingFaceApiToken: string | null;
  elevenLabsApiKey: string | null;
};

export const runSingle = (
  flowConfig: FlowConfig,
  params: RunParams,
): Observable<NodeExecutionEvent> => {
  return defer((): Observable<NodeExecutionEvent> => {
    const { edgeList, nodeConfigMap, connectorMap } = flowConfig;
    const {
      inputValueMap,
      useStreaming,
      openAiApiKey,
      huggingFaceApiToken,
      elevenLabsApiKey,
    } = params;

    let allVariableValueMap = inputValueMap;

    const context = new FlowExecutionContext(
      edgeList,
      nodeConfigMap,
      connectorMap,
    );

    const initialNodeIdList = context.getNodeIdListWithIndegreeZero();

    if (initialNodeIdList.length === 0) {
      console.warn('No valid initial nodes found.');
      return EMPTY;
    }

    // NOTE: Used to determine when to complete the observable.
    let queuedNodeCount = initialNodeIdList.length;

    const nodeIdListSubject = new BehaviorSubject<NodeID[]>(initialNodeIdList);

    return nodeIdListSubject.pipe(
      mergeMap((nodeIdList): Observable<Observable<NodeExecutionEvent>> => {
        return pipe(
          nodeIdList,
          A.map((nodeId): NodeConfig => nodeConfigMap[nodeId]),
          A.map((nodeConfig): Observable<NodeExecutionEvent> => {
            const {
              accountLevelConfigFieldDefinitions,
              createNodeExecutionObservable,
            } = getNodeDefinitionForNodeTypeName(nodeConfig.type);

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
              createNodeExecutionObservable as CreateNodeExecutionObservableFunction<NodeAllLevelConfigUnion>;

            // ANCHOR: Context

            const nodeExecutionContext = new NodeExecutionContext(context);

            // ANCHOR: NodeExecutionConfig

            const connectorList = pipe(
              connectorMap,
              D.values,
              A.filter((connector) => connector.nodeId === nodeConfig.nodeId),
            );

            // SECTION: Create NodeAllLevelConfig

            // TODO: Add validation to ensure typesafety, this cannot be done
            // in TypeScript due to the dynamic types used.
            let nodeAllLevelConfig: NodeAllLevelConfigUnion;

            if (accountLevelConfigFieldDefinitions) {
              const nodeAllLevelConfigPartial = D.mapWithKey(
                accountLevelConfigFieldDefinitions,
                (key, fd) => {
                  return useLocalStorageStore
                    .getState()
                    .getLocalAccountLevelNodeFieldValue(nodeConfig.type, key);
                },
              );

              nodeAllLevelConfig = {
                ...nodeConfig,
                ...nodeAllLevelConfigPartial,
              } as NodeAllLevelConfigUnion;
            } else {
              nodeAllLevelConfig = nodeConfig as NodeAllLevelConfigUnion;
            }

            // !SECTION

            const config: NodeExecutionConfig<NodeAllLevelConfigUnion> = {
              nodeConfig: nodeAllLevelConfig,
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
                    context.getSrcConnectorIdFromDstConnectorId(connector.id);
                  nodeInputValueMap[connector.id] =
                    allVariableValueMap[srcConnectorId];
                });
            }

            const params: NodeExecutionParams = {
              nodeInputValueMap,
              useStreaming,
              openAiApiKey,
              huggingFaceApiToken,
              elevenLabsApiKey,
            };

            // ANCHOR: Execute

            return execute(nodeExecutionContext, config, params).pipe(
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
          }),
          from,
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
                draft[id as ConnectorID] = value;
              }),
            );
          });
        } else if (event.type === NodeExecutionEventType.Finish) {
          const nextNodeIdList = context.reduceNodeIndegrees(
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
