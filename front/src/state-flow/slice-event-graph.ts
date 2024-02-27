import { PropType } from '@dhmk/utils';
import { Getter, Setter, createLens } from '@dhmk/zustand-lens';
import { D, pipe } from '@mobily/ts-belt';
import deepEqual from 'deep-equal';
import { produce } from 'immer';
import posthog from 'posthog-js';
import {
  EdgeChange,
  NodeChange,
  OnConnect,
  OnEdgesChange,
  OnNodesChange,
} from 'reactflow';
import { Subscription, from, map } from 'rxjs';
import invariant from 'tiny-invariant';
import { OperationResult } from 'urql';
import { StateCreator } from 'zustand';

import {
  Connector,
  ConnectorMap,
  ConnectorResultMap,
  ConnectorType,
  ConnectorTypeEnum,
  FlowConfigSchema,
  FlowInputVariable,
  LocalNode,
  NodeConfig,
  NodeConfigMap,
  NodeTypeEnum,
  V3FlowContent,
  V3LocalEdge,
  createNode,
} from 'flow-models';

import { FlowRunEventType, ValidationErrorType } from 'flow-run/event-types';
import flowRunSingle from 'flow-run/flowRunSingle';
import { graphql } from 'gencode-gql';
import {
  ContentVersion,
  LoadCsvEvaluationPresetQuery,
  SpaceFlowQueryQuery,
} from 'gencode-gql/graphql';
import { client } from 'graphql-util/client';
import { useLocalStorageStore } from 'state-root/local-storage-state';
import { useNodeFieldFeedbackStore } from 'state-root/node-field-feedback-state';

import { ChangeEventType } from './event-graph/event-types';
import { AcceptedEvent, handleAllEvent } from './event-graph/handle-all-event';
import { StateMachineAction } from './finite-state-machine';
import {
  FlowState,
  RunMetadataTable,
  RunOutputTable,
  VariableIdToCsvColumnIndexMap,
} from './types';
import { createWithImmer } from './util/lens-util';
import {
  VariableTypeToVariableConfigTypeMap,
  assignLocalEdgeProperties,
  assignLocalNodeProperties,
} from './util/state-utils';

export type EventGraphSliceState = {
  eventGraphState: {
    flowContent: {
      nodes: LocalNode[];
      edges: V3LocalEdge[];
      nodeConfigsDict: NodeConfigMap;
      variablesDict: ConnectorMap;
      variableValueLookUpDicts: ConnectorResultMap[];
    };
    batchTestConfig: {
      repeatTimes: number;
      concurrencyLimit: number;
      variableIdToCsvColumnIndexMap: VariableIdToCsvColumnIndexMap;
      runOutputTable: RunOutputTable;
      runMetadataTable: RunMetadataTable;
    };
    batchTestConfigCsvString: string;
  };
};

type EventGraphSliceAction = {
  initializeCanvas(): void;
  cancelCanvasInitializationIfInProgress(): void;

  // SECTION: Canvas events
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;

  addNode(type: NodeTypeEnum, x: number, y: number): void;
  removeNode(nodeId: string): void;
  updateNodeConfig(nodeId: string, change: Partial<NodeConfig>): void;

  addVariable(nodeId: string, type: ConnectorTypeEnum, index: number): void;
  removeVariable(variableId: string): void;
  updateConnector<
    T extends ConnectorTypeEnum,
    R = VariableTypeToVariableConfigTypeMap[T],
  >(
    variableId: string,
    change: Partial<R>,
  ): void;
  updateConnectors(
    updates: { variableId: string; change: Record<string, unknown> }[],
  ): void;

  updateVariableValue(variableId: string, value: unknown): void;
  updateVariableValues(updates: { variableId: string; value: unknown }[]): void;
  // !SECTION

  // SECTION: Batch tests events
  setCsvStr(csvStr: string): void;
  setRepeatTimes(repeatTimes: number): void;
  getRepeatTimes(): number;
  setConcurrencyLimit(concurrencyLimit: number): void;
  getConcurrencyLimit(): number;
  setVariableIdToCsvColumnIndexMap: Setter<VariableIdToCsvColumnIndexMap>;
  getVariableIdToCsvColumnIndexMap: Getter<VariableIdToCsvColumnIndexMap>;
  setRunOutputTable: Setter<RunOutputTable>;
  getRunOutputTable: Getter<RunOutputTable>;
  setRunMetadataTable: Setter<RunMetadataTable>;
  getRunMetadataTable: Getter<RunMetadataTable>;

  selectAndLoadPreset(presetId: string): Promise<void>;
  unselectPreset(): void;
  deleteAndUnselectPreset(): Promise<void>;
  createAndSelectPreset({ name }: { name: string }): Promise<void>;
  updateSelectedPreset({ name }: { name: string }): Promise<void>;
  savePresetConfigContentIfSelected(): Promise<void>;
  // !SECTION

  // Getter
  getEventGraphState: Getter<
    PropType<EventGraphSliceState, ['eventGraphState']>
  >;
  getFlowContent: Getter<V3FlowContent>;
  getDefaultVariableValueLookUpDict(): ConnectorResultMap;
  getBatchTestConfig: Getter<
    PropType<EventGraphSliceState, ['eventGraphState', 'batchTestConfig']>
  >;

  // Flow run
  startFlowSingleRun(): void;
  stopFlowSingleRun(): void;
  __startFlowSingleRunImpl(): void;
  __stopFlowSingleRunImpl(): void;
};

export type EventGraphSlice = EventGraphSliceState & EventGraphSliceAction;

export const createEventGraphSlice: StateCreator<
  FlowState,
  [['zustand/devtools', never]],
  [],
  EventGraphSlice
> = (set, get) => {
  // SECTION: Lenses
  const [setEventGraphState, getEventGraphState] = createLens(
    set,
    get,
    'eventGraphState',
  );

  const [setFlowContent, getFlowContent] = createLens(
    setEventGraphState,
    getEventGraphState,
    'flowContent',
  );
  const [setBatchTestConfig, getBatchTestConfig] = createLens(
    setEventGraphState,
    getEventGraphState,
    'batchTestConfig',
  );

  const [setVariableIdToCsvColumnIndexMap, getVariableIdToCsvColumnIndexMap] =
    createLens(
      setBatchTestConfig,
      getBatchTestConfig,
      'variableIdToCsvColumnIndexMap',
    );
  const [setRunOutputTable, getRunOutputTable] = createLens(
    setBatchTestConfig,
    getBatchTestConfig,
    'runOutputTable',
  );
  const [setRunMetadataTable, getRunMetadataTable] = createLens(
    setBatchTestConfig,
    getBatchTestConfig,
    'runMetadataTable',
  );
  // !SECTION

  // SECTION: With Immer
  const { setWithPatches: setEventGraphStateWithPatches } = createWithImmer<
    EventGraphSliceState,
    ['eventGraphState']
  >([setEventGraphState, getEventGraphState]);

  const { set: setFlowContentProduce } = createWithImmer<
    EventGraphSliceState,
    ['eventGraphState', 'flowContent']
  >([setFlowContent, getFlowContent]);
  // !SECTION

  let initializationSubscription: Subscription | null = null;
  let runSingleSubscription: Subscription | null = null;

  function processEventWithEventGraph(event: AcceptedEvent) {
    console.log('processEventWithEventGraph', event);

    // console.time('processEventWithEventGraph');
    setEventGraphStateWithPatches(
      (draft) => {
        handleAllEvent(draft, event);
      },
      false,
      event,
    );
    // console.timeEnd('processEventWithEventGraph');

    get().actorSend({ type: StateMachineAction.FlowContentTouched });
  }

  function resetEdgeAndMetadataBaseOnFlowRunSingleExecutingState(
    isRunning: boolean,
  ) {
    setFlowContentProduce((draft) => {
      for (const edge of draft.edges) {
        if (edge.animated !== isRunning) {
          edge.animated = isRunning;
        }
      }
    });

    let nodeMetadataDict = get().nodeMetadataDict;

    if (!isRunning) {
      // It is important to reset node metadata, because node's running status
      // doesn't depend on global isRunning state.
      nodeMetadataDict = produce(nodeMetadataDict, (draft) => {
        for (const nodeMetadata of Object.values(draft)) {
          invariant(nodeMetadata != null);
          nodeMetadata.isRunning = false;
        }
      });
    }

    set({ nodeMetadataDict });
  }

  return {
    eventGraphState: {
      flowContent: {
        nodes: [],
        edges: [],
        nodeConfigsDict: {},
        variablesDict: {},
        variableValueLookUpDicts: [{}],
      },
      batchTestConfig: {
        repeatTimes: 1,
        concurrencyLimit: 2,
        variableIdToCsvColumnIndexMap: {},
        runOutputTable: [],
        runMetadataTable: [],
      },
      batchTestConfigCsvString: '',
    },

    initializeCanvas(): void {
      const spaceId = get().spaceId;

      initializationSubscription = from(querySpace(spaceId))
        .pipe(map(parseQueryResult))
        .subscribe({
          next({ flowContent, isUpdated }) {
            const { nodes, edges, variablesDict, ...rest } = flowContent;

            const updatedNodes = assignLocalNodeProperties(nodes);
            const updatedEdges = assignLocalEdgeProperties(
              edges,
              variablesDict,
            );

            setFlowContentProduce(
              () => {
                return {
                  nodes: updatedNodes,
                  edges: updatedEdges,
                  variablesDict,
                  ...rest,
                };
              },
              false,
              { type: 'initializeCanvas', flowContent },
            );

            get().actorSend({
              type: StateMachineAction.FetchingCanvasContentSuccess,
              isUpdated,
            });
          },
          error(error) {
            // TODO: Report to telemetry
            console.error('Error fetching content', error);
            get().actorSend({
              type: StateMachineAction.FetchingCanvasContentError,
            });
          },
        });
    },
    cancelCanvasInitializationIfInProgress(): void {
      initializationSubscription?.unsubscribe();
      initializationSubscription = null;
    },

    onEdgesChange(changes: EdgeChange[]): void {
      processEventWithEventGraph({
        type: ChangeEventType.RF_EDGES_CHANGE,
        changes,
      });
    },
    onNodesChange(changes: NodeChange[]): void {
      processEventWithEventGraph({
        type: ChangeEventType.RF_NODES_CHANGE,
        changes,
      });
    },
    onConnect(connection): void {
      processEventWithEventGraph({
        type: ChangeEventType.RF_ON_CONNECT,
        connection,
      });
    },

    addNode(type: NodeTypeEnum, x: number, y: number): void {
      processEventWithEventGraph({
        type: ChangeEventType.ADDING_NODE,
        node: createNode(type, x, y),
      });
    },
    removeNode(nodeId: string): void {
      processEventWithEventGraph({
        type: ChangeEventType.REMOVING_NODE,
        nodeId: nodeId,
      });
    },
    updateNodeConfig(nodeId: string, change: Partial<NodeConfig>): void {
      processEventWithEventGraph({
        type: ChangeEventType.UPDATING_NODE_CONFIG,
        nodeId,
        change,
      });
    },

    addVariable(nodeId: string, type: ConnectorTypeEnum, index: number): void {
      processEventWithEventGraph({
        type: ChangeEventType.ADDING_VARIABLE,
        nodeId,
        connectorType: type,
        connectorIndex: index,
      });
    },
    removeVariable(variableId: string): void {
      processEventWithEventGraph({
        type: ChangeEventType.REMOVING_VARIABLE,
        variableId,
      });
    },
    updateConnector<
      T extends ConnectorTypeEnum,
      R = VariableTypeToVariableConfigTypeMap[T],
    >(variableId: string, change: Partial<R>): void {
      processEventWithEventGraph({
        type: ChangeEventType.UPDATE_CONNECTORS,
        updates: [{ variableId, change }],
      });
    },
    updateConnectors(
      updates: { variableId: string; change: Partial<Connector> }[],
    ): void {
      processEventWithEventGraph({
        type: ChangeEventType.UPDATE_CONNECTORS,
        updates,
      });
    },

    updateVariableValue(variableId: string, value: unknown): void {
      processEventWithEventGraph({
        type: ChangeEventType.UPDATE_VARIABLE_VALUES,
        updates: [{ variableId, value }],
      });
    },
    updateVariableValues(
      updates: { variableId: string; value: unknown }[],
    ): void {
      processEventWithEventGraph({
        type: ChangeEventType.UPDATE_VARIABLE_VALUES,
        updates,
      });
    },

    setCsvStr(csvStr: string): void {
      setEventGraphState({ batchTestConfigCsvString: csvStr });
    },
    setRepeatTimes(repeatTimes: number): void {
      setBatchTestConfig(() => ({ repeatTimes }));
    },
    getRepeatTimes(): number {
      return getBatchTestConfig().repeatTimes;
    },
    setConcurrencyLimit(concurrencyLimit: number): void {
      setBatchTestConfig(() => ({ concurrencyLimit }));
    },
    getConcurrencyLimit(): number {
      return getBatchTestConfig().concurrencyLimit;
    },
    setVariableIdToCsvColumnIndexMap,
    getVariableIdToCsvColumnIndexMap,
    setRunOutputTable,
    getRunOutputTable,
    setRunMetadataTable,
    getRunMetadataTable,

    async selectAndLoadPreset(presetId: string): Promise<void> {
      set({
        csvModeSelectedPresetId: presetId,
        csvEvaluationIsLoading: true,
      });

      const result = await loadPreset(get().spaceId, presetId);

      if (result.error) {
        console.error(result.error);
        return;
      }

      const preset = result.data?.result?.space?.csvEvaluationPreset;

      if (preset == null) {
        console.error('Preset not found');
        return;
      }

      const { csvContent, configContent } = preset;

      setEventGraphState({
        batchTestConfigCsvString: csvContent,
      });

      set({
        csvEvaluationIsLoading: false,
      });

      setBatchTestConfig(() =>
        configContent == null
          ? {
              variableIdToCsvColumnIndexMap: {},
              runOutputTable: [],
              runMetadataTable: [],
            }
          : JSON.parse(configContent),
      );
    },
    unselectPreset(): void {
      set(() => ({
        csvModeSelectedPresetId: null,
        csvStr: '',
      }));

      setBatchTestConfig(() => ({
        variableIdToCsvColumnIndexMap: {},
        runOutputTable: [],
        runMetadataTable: [],
      }));
    },
    async deleteAndUnselectPreset(): Promise<void> {
      const presetId = get().csvModeSelectedPresetId;
      invariant(presetId != null, 'Preset ID should not be null');

      await client
        .mutation(
          graphql(`
            mutation DeleteCsvEvaluationPresetMutation($presetId: ID!) {
              space: deleteCsvEvaluationPreset(id: $presetId) {
                id
                csvEvaluationPresets {
                  id
                }
              }
            }
          `),
          {
            presetId,
          },
        )
        .toPromise();

      get().unselectPreset();
    },
    async createAndSelectPreset({ name }: { name: string }): Promise<void> {
      const { spaceId } = get();
      const csvContent = getEventGraphState().batchTestConfigCsvString;
      const configContent = getBatchTestConfig();

      const result = await client
        .mutation(
          graphql(`
            mutation CreateCsvEvaluationPresetMutation(
              $spaceId: ID!
              $name: String!
              $csvContent: String
              $configContent: String
            ) {
              result: createCsvEvaluationPreset(
                spaceId: $spaceId
                name: $name
                csvContent: $csvContent
                configContent: $configContent
              ) {
                space {
                  id
                  csvEvaluationPresets {
                    id
                  }
                }
                csvEvaluationPreset {
                  id
                  name
                  csvContent
                  configContent
                }
              }
            }
          `),
          {
            spaceId,
            name,
            csvContent,
            configContent: JSON.stringify(configContent),
          },
        )
        .toPromise();

      const presetId = result.data?.result?.csvEvaluationPreset?.id;
      invariant(presetId != null, 'Preset ID should not be null');

      get().selectAndLoadPreset(presetId);
    },
    async updateSelectedPreset({ name }: { name: string }): Promise<void> {
      const { csvModeSelectedPresetId: presetId } = get();
      const csvContent = getEventGraphState().batchTestConfigCsvString;
      const configContent = getBatchTestConfig();

      invariant(presetId != null, 'Preset ID should not be null');

      await client
        .mutation(
          graphql(`
            mutation UpdateCsvEvaluationPresetMutation(
              $presetId: ID!
              $name: String
              $csvContent: String
              $configContent: String
            ) {
              updateCsvEvaluationPreset(
                presetId: $presetId
                name: $name
                csvContent: $csvContent
                configContent: $configContent
              ) {
                id
                name
                csvContent
                configContent
              }
            }
          `),
          {
            presetId,
            name,
            csvContent,
            configContent: JSON.stringify(configContent),
          },
        )
        .toPromise();
    },
    async savePresetConfigContentIfSelected(): Promise<void> {
      const { csvModeSelectedPresetId: presetId } = get();
      const configContent = getBatchTestConfig();

      if (presetId == null) {
        return;
      }

      await client
        .mutation(
          graphql(`
            mutation SavePresetConfigContent(
              $presetId: ID!
              $configContent: String!
            ) {
              updateCsvEvaluationPreset(
                presetId: $presetId
                configContent: $configContent
              ) {
                id
                configContent
              }
            }
          `),
          {
            presetId,
            configContent: JSON.stringify(configContent),
          },
        )
        .toPromise();
    },

    getEventGraphState,
    getFlowContent(): V3FlowContent {
      return getFlowContent();
    },
    getDefaultVariableValueLookUpDict(): ConnectorResultMap {
      return getFlowContent().variableValueLookUpDicts[0]!;
    },
    getBatchTestConfig,

    startFlowSingleRun() {
      get().actorSend({ type: StateMachineAction.StartExecutingFlowSingleRun });
    },
    stopFlowSingleRun() {
      posthog.capture('Manually Stopped Simple Evaluation', {
        flowId: get().spaceId,
      });

      get().actorSend({
        type: StateMachineAction.StopExecutingFlowSingleRun,
      });
    },

    __startFlowSingleRunImpl() {
      posthog.capture('Starting Simple Evaluation', {
        flowId: get().spaceId,
      });

      const { edges, nodeConfigsDict, variablesDict } = get().getFlowContent();
      const variableValueLookUpDict = get().getDefaultVariableValueLookUpDict();

      const flowInputVariableValueMap: Readonly<
        Record<string, Readonly<unknown>>
      > = selectFlowInputVariableIdToValueMap(
        variablesDict,
        variableValueLookUpDict,
      );

      // NOTE: Stop previous run if there is one
      runSingleSubscription?.unsubscribe();

      // TODO: Give a default for every node instead of empty object
      set({ nodeMetadataDict: {} });

      resetEdgeAndMetadataBaseOnFlowRunSingleExecutingState(true);

      // Reset variable values except for flow inputs values
      setFlowContentProduce((draft) => {
        draft.variableValueLookUpDicts = [flowInputVariableValueMap];
      });

      useNodeFieldFeedbackStore.getState().clearFieldFeedbacks();

      runSingleSubscription = flowRunSingle({
        edges: edges.map((edge) => ({
          sourceNode: edge.source,
          sourceConnector: edge.sourceHandle,
          targetNode: edge.target,
          targetConnector: edge.targetHandle,
        })),
        nodeConfigs: nodeConfigsDict,
        connectors: variablesDict,
        inputValueMap: flowInputVariableValueMap,
        preferStreaming: true,
        getAccountLevelFieldValue: (
          nodeType: NodeTypeEnum,
          fieldKey: string,
        ) => {
          return useLocalStorageStore
            .getState()
            .getLocalAccountLevelNodeFieldValue(nodeType, fieldKey);
        },
      }).subscribe({
        next(data) {
          switch (data.type) {
            case FlowRunEventType.ValidationErrors: {
              data.errors.forEach((error) => {
                switch (error.type) {
                  case ValidationErrorType.FlowLevel: {
                    // TODO: Show flow level errors in UI
                    alert(error.message);
                    break;
                  }
                  case ValidationErrorType.NodeLevel: {
                    // TODO: Show node level errors in UI
                    get().updateNodeAugment(error.nodeId, {
                      isRunning: false,
                      hasError: true,
                    });
                    break;
                  }
                  case ValidationErrorType.FieldLevel: {
                    useNodeFieldFeedbackStore.getState().setFieldFeedbacks(
                      error.nodeId,
                      error.fieldKey,
                      // TODO: Allow setting multiple field level feedbacks
                      // Currently, new error message will replace the old one.
                      [error.message],
                    );

                    get().updateNodeAugment(error.nodeId, {
                      isRunning: false,
                      hasError: true,
                    });
                    break;
                  }
                }
              });
              break;
            }
            case FlowRunEventType.NodeStart: {
              const { nodeId } = data;
              get().updateNodeAugment(nodeId, {
                isRunning: true,
              });
              break;
            }
            case FlowRunEventType.NodeFinish: {
              const { nodeId } = data;
              get().updateNodeAugment(nodeId, {
                isRunning: false,
              });
              break;
            }
            case FlowRunEventType.NodeErrors: {
              const { nodeId } = data;
              get().updateNodeAugment(nodeId, {
                isRunning: false,
                hasError: true,
              });
              break;
            }
            case FlowRunEventType.VariableValues: {
              get().updateVariableValues(
                Object.entries(data.variableValues).map(
                  ([variableId, value]) => ({ variableId, value }),
                ),
              );
              break;
            }
          }
        },
        error(error) {
          posthog.capture('Finished Simple Evaluation with Error', {
            flowId: get().spaceId,
          });

          console.error(error);

          get().actorSend({
            type: StateMachineAction.FinishedExecutingFlowSingleRun,
          });

          resetEdgeAndMetadataBaseOnFlowRunSingleExecutingState(false);
        },
        complete() {
          posthog.capture('Finished Simple Evaluation', {
            flowId: get().spaceId,
          });

          get().actorSend({
            type: StateMachineAction.FinishedExecutingFlowSingleRun,
          });

          resetEdgeAndMetadataBaseOnFlowRunSingleExecutingState(false);
        },
      });
    },
    __stopFlowSingleRunImpl() {
      runSingleSubscription?.unsubscribe();
      runSingleSubscription = null;

      resetEdgeAndMetadataBaseOnFlowRunSingleExecutingState(false);
    },
  };
};

async function querySpace(
  spaceId: string,
): Promise<OperationResult<SpaceFlowQueryQuery>> {
  return await client
    .query(
      graphql(`
        query SpaceFlowQuery($spaceId: UUID!) {
          result: space(id: $spaceId) {
            space {
              id
              name
              contentVersion
              contentV3
            }
          }
        }
      `),
      { spaceId },
      { requestPolicy: 'network-only' },
    )
    .toPromise();
}

function parseQueryResult(result: OperationResult<SpaceFlowQueryQuery>) {
  // TODO: Report to telemetry
  invariant(result.data?.result?.space != null);

  const version = result.data.result.space.contentVersion;
  const contentV3Str = result.data.result.space.contentV3;

  // TODO: Report to telemetry
  invariant(version === ContentVersion.V3, 'Only v3 is supported');

  switch (version) {
    case ContentVersion.V3: {
      invariant(contentV3Str != null, 'contentV3Str is not null');

      // TODO: Report parse error to telemetry
      const data = JSON.parse(contentV3Str) as Partial<V3FlowContent>;

      const result = FlowConfigSchema.validate(data, {
        stripUnknown: true,
      });

      // TODO: Report validation error
      invariant(
        result.error == null,
        `Validation error: ${result.error?.message}`,
      );

      return {
        flowContent: result.value,
        isUpdated: !deepEqual(data, result.value),
      };
    }
  }
}

async function loadPreset(
  spaceId: string,
  presetId: string,
): Promise<OperationResult<LoadCsvEvaluationPresetQuery>> {
  return await client
    .query(
      graphql(`
        query LoadCsvEvaluationPreset($spaceId: UUID!, $presetId: ID!) {
          result: space(id: $spaceId) {
            space {
              id
              csvEvaluationPreset(id: $presetId) {
                id
                csvContent
                configContent
              }
            }
          }
        }
      `),
      {
        spaceId,
        presetId,
      },
    )
    .toPromise();
}

function selectFlowInputVariableIdToValueMap(
  variablesDict: ConnectorMap,
  variableValueLookUpDict: ConnectorResultMap,
): Record<string, Readonly<unknown>> {
  return pipe(
    variablesDict,
    D.filter((connector): connector is FlowInputVariable => {
      return connector.type === ConnectorType.FlowInput;
    }),
    D.map((connector) => {
      invariant(connector != null, 'connector is not null');
      return variableValueLookUpDict[connector.id] as Readonly<unknown>;
    }),
  );
}
