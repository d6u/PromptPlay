import { filter, flatten, map } from "ramda";
import pipe from "ramda/es/pipe";
import propEq from "ramda/es/propEq";
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import {
  FlowInputItem,
  FlowOutputItem,
  InputNodeConfig,
  NodeType,
  OutputNodeConfig,
} from "./flowTypes";
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

export function flowInputItemsSelector(state: FlowState): FlowInputItem[] {
  const { nodes, nodeConfigs } = state;

  return pipe(
    filter(propEq<string>(NodeType.InputNode, "type")),
    map((node) => nodeConfigs[node.id] as InputNodeConfig),
    map((nodeConfig) => nodeConfig.outputs),
    flatten
  )(nodes);
}

export function flowOutputItemsSelector(state: FlowState): FlowOutputItem[] {
  const { nodes, nodeConfigs } = state;

  return pipe(
    filter(propEq<string>(NodeType.OutputNode, "type")),
    map((node) => nodeConfigs[node.id] as OutputNodeConfig),
    map((nodeConfig) => nodeConfig.inputs),
    flatten
  )(nodes);
}
