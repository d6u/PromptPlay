import { debounce } from "lodash";
import map from "lodash/map";
import { assoc, pick } from "ramda";
import { Observable, defer, map as $map } from "rxjs";
import { graphql } from "../gql";
import { client } from "../state/urql";
import { FlowContent, ServerEdge, ServerNode } from "./flowTypes";
import { rejectInvalidEdges } from "./flowUtils";

export const SPACE_FLOW_QUERY = graphql(`
  query SpaceFlowQuery($spaceId: UUID!) {
    result: space(id: $spaceId) {
      isReadOnly
      space {
        ...SpaceSubHeaderFragment
        id
        name
        contentVersion
        flowContent
      }
    }
  }
`);

export const UPDATE_SPACE_FLOW_CONTENT_MUTATION = graphql(`
  mutation UpdateSpaceFlowContentMutation(
    $spaceId: ID!
    $flowContent: String!
  ) {
    updateSpace(id: $spaceId, flowContent: $flowContent) {
      id
      name
      flowContent
    }
  }
`);

export function queryFlowObservable(spaceId: string): Observable<{
  isCurrentUserOwner: boolean;
  flowContent: Partial<FlowContent>;
}> {
  return defer(() =>
    client
      .query(
        SPACE_FLOW_QUERY,
        { spaceId },
        { requestPolicy: "cache-and-network" }
      )
      .toPromise()
  ).pipe(
    $map((result) => {
      // TODO: handle error

      const flowContentStr = result.data?.result?.space?.flowContent;

      let flowContent: Partial<FlowContent> = {};

      if (flowContentStr) {
        try {
          flowContent = JSON.parse(flowContentStr);
        } catch (e) {
          // TODO: handle parse error
          console.error(e);
        }
      }

      return {
        isCurrentUserOwner: !result.data?.result?.isReadOnly,
        flowContent,
      };
    })
  );
}

export async function updateSpace(
  spaceId: string,
  currentFlowContent: FlowContent,
  flowContentChange: Partial<FlowContent>
) {
  if ("nodes" in flowContentChange) {
    currentFlowContent = assoc(
      "nodes",
      map(
        flowContentChange.nodes,
        pick(["id", "type", "position", "data"])<ServerNode>
      ),
      currentFlowContent
    );
  }

  if ("edges" in flowContentChange) {
    currentFlowContent = assoc(
      "edges",
      map(
        rejectInvalidEdges(
          currentFlowContent.nodes,
          flowContentChange.edges!,
          currentFlowContent.nodeConfigs
        ),
        pick([
          "id",
          "source",
          "sourceHandle",
          "target",
          "targetHandle",
        ])<ServerEdge>
      ),
      currentFlowContent
    );
  }

  await client.mutation(UPDATE_SPACE_FLOW_CONTENT_MUTATION, {
    spaceId,
    flowContent: JSON.stringify(currentFlowContent),
  });
}

export const updateSpaceDebounced = debounce(updateSpace, 500);
