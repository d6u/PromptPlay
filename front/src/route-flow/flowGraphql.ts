import { Observable, defer, map } from "rxjs";
import { graphql } from "../gql";
import { client } from "../state/urql";
import { FlowContent } from "./flowTypes";

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
    map((result) => {
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
