import { pipe, A, F, flow, D } from "@mobily/ts-belt";
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import {
  FlowInputItem,
  FlowOutputItem,
  InputNodeConfig,
  NodeType,
  OutputNodeConfig,
} from "../flowTypes";
import { createClientSlice } from "./storeClientSlice";
import { createFlowServerSlice } from "./storeFlowServerSlice";
import { FlowState } from "./storeTypes";

export const useFlowStore = create<FlowState>()(
  devtools(
    (...a) => ({
      ...createClientSlice(...a),
      ...createFlowServerSlice(...a),
    }),
    {
      store: "FlowState",
      anonymousActionType: "setState",
    }
  )
);

export function flowInputItemsSelector(
  state: FlowState
): readonly FlowInputItem[] {
  const { nodes, nodeConfigs } = state;

  return pipe(
    nodes,
    A.filter(flow(D.get("type"), F.equals(NodeType.InputNode))),
    A.map((node) => nodeConfigs[node.id] as InputNodeConfig),
    A.map(D.getUnsafe("outputs")),
    A.flat
  );
}

export function flowInputItemsWithNodeConfigSelector(
  state: FlowState
): readonly { inputItem: FlowInputItem; nodeConfig: InputNodeConfig }[] {
  const { nodes, nodeConfigs } = state;

  return pipe(
    nodes,
    A.filter(flow(D.get("type"), F.equals(NodeType.InputNode))),
    A.map((node) => nodeConfigs[node.id] as InputNodeConfig),
    A.map((nodeConfig) =>
      A.map(nodeConfig.outputs, (o) => ({ inputItem: o, nodeConfig }))
    ),
    A.flat
  );
}

export function flowOutputItemsSelector(
  state: FlowState
): readonly FlowOutputItem[] {
  const { nodes, nodeConfigs } = state;

  return pipe(
    nodes,
    A.filter(flow(D.get("type"), F.equals(NodeType.OutputNode))),
    A.map((node) => nodeConfigs[node.id] as OutputNodeConfig),
    A.map((nodeConfig) => nodeConfig.inputs),
    A.flat
  );
}
