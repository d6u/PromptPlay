import { useQuery } from "@apollo/client";
import { useParams } from "react-router-dom";
import Workspace from "./Workspace";
import { WORKSPACE_ROUTE_QUERY } from "./WorkspaceRouteQuery";
import SubHeader from "./sub_header/SubHeader";

type Props = {};

export default function WorkspaceRoute(props: Props) {
  // TODO: Properly handle spaceId not being present
  const { spaceId = "" } = useParams<{ spaceId: string }>();

  const queryResult = useQuery(WORKSPACE_ROUTE_QUERY, {
    variables: {
      workspaceId: spaceId,
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
      <SubHeader workspaceId={spaceId} subHeaderFragment={queryResult.data} />
      <Workspace workspaceFragment={queryResult.data} />
    </>
  );
}
