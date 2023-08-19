import Workspace from "./Workspace";
import { WORKSPACE_ROUTE_QUERY } from "./WorkspaceRouteQuery";
import SubHeader from "./sub_header/SubHeader";
import { useQuery } from "@apollo/client";

type Props = {
  workspaceId: string;
};

export default function WorkspaceRoute({ workspaceId }: Props) {
  const queryResult = useQuery(WORKSPACE_ROUTE_QUERY, {
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
