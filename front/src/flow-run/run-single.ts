import { A, D, pipe } from '@mobily/ts-belt';
import {
  FlowExecutionContext,
  FlowOutputVariable,
  GraphEdge,
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
  V3VariableID,
  V3VariableValueLookUpDict,
  VariableType,
  VariablesDict,
  getNodeDefinitionForNodeTypeName,
} from 'flow-models';
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

export type FlowConfig = {
  edgeList: GraphEdge[];
  nodeConfigMap: NodeConfigMap;
  connectorMap: VariablesDict;
};

export type RunParams = {
  inputValueMap: V3VariableValueLookUpDict;
  useStreaming: boolean;
  openAiApiKey: string | null;
  huggingFaceApiToken: string | null;
  elevenLabsApiKey: string | null;
};

export const runSingle = (
  flowConfig: FlowConfig,
  params: RunParams,
): Observable<NodeExecutionEvent> =>
  defer((): Observable<NodeExecutionEvent> => {
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
            const { createNodeExecutionObservable: execute } =
              getNodeDefinitionForNodeTypeName(nodeConfig.type);

            // NOTE: Context

            const nodeExecutionContext = new NodeExecutionContext(context);

            // NOTE: NodeExecutionConfig

            const connectorList = pipe(
              connectorMap,
              D.values,
              A.filter((connector) => connector.nodeId === nodeConfig.nodeId),
            );

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const config: NodeExecutionConfig<any> = {
              nodeConfig,
              connectorList,
            };

            // NOTE: NodeExecutionParams

            const nodeInputValueMap: V3VariableValueLookUpDict = {};

            if (nodeConfig.type === NodeType.InputNode) {
              connectorList.forEach((connector) => {
                nodeInputValueMap[connector.id] =
                  allVariableValueMap[connector.id];
              });
            } else {
              connectorList
                .filter(
                  (conn): conn is FlowOutputVariable | NodeInputVariable =>
                    conn.type === VariableType.NodeInput ||
                    conn.type === VariableType.FlowOutput,
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

            // NOTE: Execute

            return execute(nodeExecutionContext, config, params).pipe(
              catchError<NodeExecutionEvent, Observable<NodeExecutionEvent>>(
                (err) => {
                  console.error(err);

                  // NOTE: Expected errors from the observable will be emitted as
                  // NodeExecutionEventType.Errors event.
                  //
                  // For unexpected errors, we will convert them to
                  // NodeExecutionEventType.Errors and always end with
                  // NodeExecutionEventType.Finish event per expectation.

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
          // NOTE: Update `allVariableValueMap` with values from
          // node execution outputs.
          allVariableValueMap = produce(allVariableValueMap, (draft) => {
            pipe(
              event.variableValuesLookUpDict,
              D.toPairs,
              A.forEach(([id, value]) => {
                draft[id as V3VariableID] = value;
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
            // NOTE: Incrementing count on NodeExecutionEventType.Start event
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
