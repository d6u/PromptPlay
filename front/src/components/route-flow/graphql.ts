import { Observable } from "rxjs";
import { OperationResult } from "urql";
import { graphql } from "../../gql";
import { SpaceFlowQueryQuery } from "../../gql/graphql";
import { V3FlowContent } from "../../models/v3-flow-content-types";
import { client } from "../../state/urql";
import { toRxObservableSingle } from "../../utils/graphql-utils";

const SPACE_FLOW_QUERY = graphql(`
  query SpaceFlowQuery($spaceId: UUID!) {
    result: space(id: $spaceId) {
      space {
        id
        name
        contentVersion
        flowContent
        contentV3
      }
    }
  }
`);

const UPDATE_SPACE_FLOW_CONTENT_MUTATION = graphql(`
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

const UPDATE_SPACE_CONTENT_V3_MUTATION = graphql(`
  mutation UpdateSpaceContentV3Mutation($spaceId: ID!, $contentV3: String!) {
    updateSpace(id: $spaceId, contentV3: $contentV3) {
      id
      contentV3
    }
  }
`);

export async function updateSpaceContentV3(
  spaceId: string,
  contentV3: V3FlowContent,
) {
  console.group("saveSpaceContentV3");
  await client.mutation(UPDATE_SPACE_CONTENT_V3_MUTATION, {
    spaceId,
    contentV3: JSON.stringify(contentV3),
  });
  console.groupEnd();
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
