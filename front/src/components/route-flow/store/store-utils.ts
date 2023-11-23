import { produce } from "immer";
import { Observable } from "rxjs";
import { OperationResult } from "urql";
import { SpaceFlowQueryQuery } from "../../../gql/graphql";
import {
  FlowContentV3,
  LocalEdge,
  LocalNode,
} from "../../../models/flow-content-types";
import { client } from "../../../state/urql";
import { toRxObservableSingle } from "../../../utils/graphql-utils";
import { DEFAULT_EDGE_STYLE, DRAG_HANDLE_CLASS_NAME } from "./flowConstants";
import {
  SPACE_FLOW_QUERY,
  UPDATE_SPACE_CONTENT_V3_MUTATION,
} from "./graphql-flow";

export function assignLocalNodeProperties(nodes: LocalNode[]): LocalNode[] {
  return produce(nodes, (draft) => {
    for (const node of draft) {
      if (!node.dragHandle) {
        node.dragHandle = `.${DRAG_HANDLE_CLASS_NAME}`;
      }
    }
  });
}

export function assignLocalEdgeProperties(edges: LocalEdge[]): LocalEdge[] {
  return produce(edges, (draft) => {
    for (const edge of draft) {
      if (!edge.style) {
        edge.style = DEFAULT_EDGE_STYLE;
      }
    }
  });
}

export function fetchContent(
  spaceId: string
): Observable<OperationResult<SpaceFlowQueryQuery>> {
  return toRxObservableSingle(
    client.query(
      SPACE_FLOW_QUERY,
      { spaceId },
      { requestPolicy: "network-only" }
    )
  );
}

export async function saveSpaceContentV3(
  spaceId: string,
  contentV3: FlowContentV3
) {
  await client.mutation(UPDATE_SPACE_CONTENT_V3_MUTATION, {
    spaceId: spaceId,
    contentV3: JSON.stringify(contentV3),
  });
}
