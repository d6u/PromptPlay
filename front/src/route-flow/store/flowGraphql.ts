import { A, D } from "@mobily/ts-belt";
import { debounce } from "lodash";
import { Observable, defer, map as $map } from "rxjs";
import { graphql } from "../../gql";
import { client } from "../../state/urql";
import { FlowContent } from "../flowTypes";
import { rejectInvalidEdges } from "../flowUtils";

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

export const CREATE_CSV_EVALUATION_PRESET_MUTATION = graphql(`
  mutation CreateCsvEvaluationPresetMutation(
    $spaceId: ID!
    $name: String!
    $csvContent: String
  ) {
    result: createCsvEvaluationPreset(
      spaceId: $spaceId
      name: $name
      csvContent: $csvContent
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
`);

export const UPDATE_CSV_EVALUATION_PRESET_MUTATION = graphql(`
  mutation UpdateCsvEvaluationPresetMutation(
    $presetId: ID!
    $name: String
    $csvContent: String
  ) {
    updateCsvEvaluationPreset(
      presetId: $presetId
      name: $name
      csvContent: $csvContent
    ) {
      id
      name
      csvContent
      configContent
    }
  }
`);

export const DELETE_CSV_EVALUATION_PRESET_MUTATION = graphql(`
  mutation DeleteCsvEvaluationPresetMutation($presetId: ID!) {
    space: deleteCsvEvaluationPreset(id: $presetId) {
      id
      csvEvaluationPresets {
        id
      }
    }
  }
`);

export function queryFlowObservable(spaceId: string): Observable<{
  isCurrentUserOwner: boolean;
  flowContent: Partial<FlowContent>;
}> {
  return defer(() =>
    client
      .query(SPACE_FLOW_QUERY, { spaceId }, { requestPolicy: "network-only" })
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
  if ("nodes" in flowContentChange && flowContentChange.nodes) {
    currentFlowContent = D.set(
      currentFlowContent,
      "nodes",
      A.map(
        flowContentChange.nodes,
        D.selectKeys(["id", "type", "position", "data"])
      )
    );
  }

  if ("edges" in flowContentChange && flowContentChange.edges) {
    currentFlowContent = D.set(
      currentFlowContent,
      "edges",
      A.map(
        rejectInvalidEdges(
          currentFlowContent.nodes,
          flowContentChange.edges,
          currentFlowContent.nodeConfigs
        ),
        D.selectKeys(["id", "source", "sourceHandle", "target", "targetHandle"])
      )
    );
  }

  await client.mutation(UPDATE_SPACE_FLOW_CONTENT_MUTATION, {
    spaceId,
    flowContent: JSON.stringify(currentFlowContent),
  });
}

export const updateSpaceDebounced = debounce(updateSpace, 500);

export async function updateCSVEvaluationPreset(
  presetId: string,
  // name: string,
  csvContent: string
) {
  await client.mutation(UPDATE_CSV_EVALUATION_PRESET_MUTATION, {
    presetId,
    // name,
    csvContent,
  });
}

export async function deleteCSVEvaluationPreset(presetId: string) {
  await client.mutation(DELETE_CSV_EVALUATION_PRESET_MUTATION, {
    presetId,
  });
}
