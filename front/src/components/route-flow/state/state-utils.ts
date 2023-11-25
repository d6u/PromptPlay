import { produce } from "immer";
import { Observable } from "rxjs";
import { OperationResult } from "urql";
import { SpaceFlowQueryQuery } from "../../../gql/graphql";
import { LocalNode, NodeID } from "../../../models/v2-flow-content-types";
import {
  FlowInputVariable,
  FlowOutputVariable,
  NodeInputVariable,
  NodeOutputVariable,
  V3FlowContent,
  V3LocalEdge,
  VariablesDict,
  VariableType,
} from "../../../models/v3-flow-content-types";
import { client } from "../../../state/urql";
import { toRxObservableSingle } from "../../../utils/graphql-utils";
import { DEFAULT_EDGE_STYLE, DRAG_HANDLE_CLASS_NAME } from "../constants";
import { SPACE_FLOW_QUERY, UPDATE_SPACE_CONTENT_V3_MUTATION } from "../graphql";

export function assignLocalNodeProperties(nodes: LocalNode[]): LocalNode[] {
  return produce(nodes, (draft) => {
    for (const node of draft) {
      if (!node.dragHandle) {
        node.dragHandle = `.${DRAG_HANDLE_CLASS_NAME}`;
      }
    }
  });
}

export function assignLocalEdgeProperties(edges: V3LocalEdge[]): V3LocalEdge[] {
  return produce(edges, (draft) => {
    for (const edge of draft) {
      if (!edge.style) {
        edge.style = DEFAULT_EDGE_STYLE;
      }
    }
  });
}

export function fetchContent(
  spaceId: string,
): Observable<OperationResult<SpaceFlowQueryQuery>> {
  return toRxObservableSingle(
    client.query(
      SPACE_FLOW_QUERY,
      { spaceId },
      { requestPolicy: "network-only" },
    ),
  );
}

export async function saveSpaceContentV3(
  spaceId: string,
  contentV3: V3FlowContent,
) {
  await client.mutation(UPDATE_SPACE_CONTENT_V3_MUTATION, {
    spaceId: spaceId,
    contentV3: JSON.stringify(contentV3),
  });
}

export type VariableTypeToVariableConfigTypeMap = {
  [VariableType.NodeInput]: NodeInputVariable;
  [VariableType.NodeOutput]: NodeOutputVariable;
  [VariableType.FlowInput]: FlowInputVariable;
  [VariableType.FlowOutput]: FlowOutputVariable;
};

export function selectVariables<
  T extends VariableType,
  R = VariableTypeToVariableConfigTypeMap[T],
>(nodeId: NodeID, type: T, variableConfigs: VariablesDict): R[] {
  return Object.values(variableConfigs)
    .filter(
      (variableConfig) =>
        variableConfig.nodeId === nodeId && variableConfig.type === type,
    )
    .sort((a, b) => a.index - b.index) as R[];
}

export function selectAllVariables<
  T extends VariableType,
  R = VariableTypeToVariableConfigTypeMap[T],
>(type: T, variableMap: VariablesDict): R[] {
  return Object.values(variableMap)
    .filter((variableConfig) => variableConfig.type === type)
    .sort((a, b) => a.index - b.index) as R[];
}
