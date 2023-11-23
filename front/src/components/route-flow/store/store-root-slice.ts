import { D } from "@mobily/ts-belt";
import { produce } from "immer";
import posthog from "posthog-js";
import { Observable, Subscription, map } from "rxjs";
import { OperationResult } from "urql";
import { StateCreator } from "zustand";
import { SpaceFlowQueryQuery } from "../../../gql/graphql";
import {
  FlowContent,
  NodeID,
  VariableID,
  VariableValueMap,
} from "../../../models/flow-content-types";
import { convert } from "../../../models/flow-content-v2-to-v3-utils";
import { client } from "../../../state/urql";
import { toRxObservableSingle } from "../../../utils/graphql-utils";
import { run, RunEventType } from "./flow-run";
import { SPACE_FLOW_QUERY } from "./graphql-flow";
import { flowInputItemsSelector } from "./store-flow";
import {
  assignLocalEdgeProperties,
  assignLocalNodeProperties,
} from "./store-utils";
import { FlowState } from "./types-local-state";
import { NodeAugment } from "./types-local-state";
import { NodeAugments } from "./types-local-state";
import { DetailPanelContentType } from "./types-local-state";

type RootSliceState = {
  spaceId: string | null;
  isInitialized: boolean;
  detailPanelContentType: DetailPanelContentType;
  detailPanelSelectedNodeId: NodeID | null;
  localNodeAugments: NodeAugments;
  isRunning: boolean;
};

export type RootSlice = RootSliceState & {
  initializeSpace(spaceId: string): void;
  deinitializeSpace(): void;
  setDetailPanelContentType(type: DetailPanelContentType): void;
  setDetailPanelSelectedNodeId(nodeId: NodeID): void;
  resetAugments(): void;
  updateNodeAugment(nodeId: NodeID, change: Partial<NodeAugment>): void;
  runFlow(): void;
  stopRunningFlow(): void;
};

const ROOT_SLICE_INITIAL_STATE: RootSliceState = {
  spaceId: null,
  isInitialized: false,
  detailPanelContentType: DetailPanelContentType.Off,
  detailPanelSelectedNodeId: null,
  localNodeAugments: {},
  isRunning: false,
};

export const createRootSlice: StateCreator<FlowState, [], [], RootSlice> = (
  set,
  get
) => {
  function setIsRunning(isRunning: boolean) {
    set((state) => {
      let edges = state.edges;
      let localNodeAugments = state.localNodeAugments;

      edges = produce(edges, (draft) => {
        for (const edge of draft) {
          if (edge.animated !== isRunning) {
            edge.animated = isRunning;
          }
        }
      });

      if (!isRunning) {
        // It is important to reset node augment, because node's running status
        // doesn't depend on global isRunning state.
        localNodeAugments = D.map(localNodeAugments, D.set("isRunning", false));
      }

      return { isRunning, edges, localNodeAugments };
    });
  }

  let fetchFlowSubscription: Subscription | null = null;
  let runFlowSubscription: Subscription | null = null;

  return {
    ...ROOT_SLICE_INITIAL_STATE,

    initializeSpace(spaceId: string) {
      set({ spaceId, isInitialized: false });

      get().resetFlowServerSlice();

      fetchFlowSubscription?.unsubscribe();
      fetchFlowSubscription = fetchFlowContent(get().spaceId!).subscribe({
        next({
          nodes = [],
          edges = [],
          nodeConfigs = {},
          variableValueMaps = [{}],
        }) {
          nodes = assignLocalNodeProperties(nodes);
          edges = assignLocalEdgeProperties(edges);

          set({ nodes, edges, nodeConfigs, variableValueMaps });
        },
        complete() {
          const r = convert(get());
          console.log(r);

          set({ isInitialized: true });
        },
        error(error) {
          console.error("Error fetching flow content", error);
        },
      });
    },

    deinitializeSpace() {
      fetchFlowSubscription?.unsubscribe();
      fetchFlowSubscription = null;

      set({ spaceId: null, isInitialized: false });
    },

    setDetailPanelContentType(type: DetailPanelContentType) {
      set({ detailPanelContentType: type });
    },
    setDetailPanelSelectedNodeId(id: NodeID) {
      set({ detailPanelSelectedNodeId: id });
    },

    resetAugments() {
      set({ localNodeAugments: {} });
    },
    updateNodeAugment(nodeId: NodeID, change: Partial<NodeAugment>) {
      let localNodeAugments = get().localNodeAugments;

      let augment = localNodeAugments[nodeId];

      if (augment) {
        augment = { ...augment, ...change };
      } else {
        augment = { isRunning: false, hasError: false, ...change };
      }

      localNodeAugments = D.set(localNodeAugments, nodeId, augment);

      set({ localNodeAugments });
    },

    runFlow() {
      posthog.capture("Starting Simple Evaluation", { flowId: get().spaceId });

      runFlowSubscription?.unsubscribe();
      runFlowSubscription = null;

      const {
        resetAugments,
        edges,
        nodeConfigs,
        updateNodeAugment,
        updateVariableValueMap,
      } = get();

      resetAugments();

      setIsRunning(true);

      const inputVariableMap: VariableValueMap = {};
      const defaultVariableValueMap = get().getDefaultVariableValueMap();

      for (const inputItem of flowInputItemsSelector(get())) {
        inputVariableMap[inputItem.id] = defaultVariableValueMap[inputItem.id];
      }

      runFlowSubscription = run(
        edges,
        nodeConfigs,
        inputVariableMap,
        true
      ).subscribe({
        next(data) {
          switch (data.type) {
            case RunEventType.VariableValueChanges: {
              const { changes } = data;
              for (const [outputId, value] of Object.entries(changes)) {
                updateVariableValueMap(outputId as VariableID, value);
              }
              break;
            }
            case RunEventType.NodeAugmentChange: {
              const { nodeId, augmentChange } = data;
              updateNodeAugment(nodeId, augmentChange);
              break;
            }
            case RunEventType.RunStatusChange:
              // TODO: Refect this in the simple evaluation UI
              break;
          }
        },
        error(e) {
          console.error(e);
          setIsRunning(false);

          posthog.capture("Finished Simple Evaluation with Error", {
            flowId: get().spaceId,
          });
        },
        complete() {
          setIsRunning(false);

          posthog.capture("Finished Simple Evaluation", {
            flowId: get().spaceId,
          });
        },
      });
    },

    stopRunningFlow() {
      setIsRunning(false);

      runFlowSubscription?.unsubscribe();
      runFlowSubscription = null;
    },
  };
};

function fetchFlowContent(spaceId: string): Observable<Partial<FlowContent>> {
  return toRxObservableSingle(
    client.query(
      SPACE_FLOW_QUERY,
      { spaceId },
      { requestPolicy: "network-only" }
    )
  ).pipe(
    map<OperationResult<SpaceFlowQueryQuery>, Partial<FlowContent>>(
      (result) => {
        const flowContentStr = result.data?.result?.space?.flowContent;

        if (flowContentStr) {
          try {
            return JSON.parse(flowContentStr);
          } catch (e) {
            // TODO: handle parse error
            console.error(e);
          }
        }

        return {};
      }
    )
  );
}
