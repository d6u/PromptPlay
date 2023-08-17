import { gql } from "../../__generated__";
import Workspace from "./Workspace";
import SubHeader from "./sub_header/SubHeader";
import { useQuery } from "@apollo/client";

const ROOT_ROUTE_QUERY = gql(`
  query WorkspaceRouteQuery(
    $workspaceId: UUID!
  ) {
    user {
      id
    }
    ...SubHeaderFragment
    ...WorkspaceQuery
  }
`);

type Props = {
  workspaceId: string;
};

export default function WorkspaceRoute({ workspaceId }: Props) {
  const queryResult = useQuery(ROOT_ROUTE_QUERY, {
    variables: {
      workspaceId,
    },
  });

  if (queryResult.loading) {
    return <div>Loading...</div>;
  }

  if (queryResult.error != null) {
    return <div>Error! {queryResult.error.message}</div>;
  }

  if (queryResult.data == null) {
    return <div>Could not find any data.</div>;
  }

  return (
    <>
      <SubHeader
        workspaceId={workspaceId}
        subHeaderFragment={queryResult.data}
      />
      <Workspace workspaceFragment={queryResult.data} />
    </>
  );
}
