import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ReactFlowProvider } from "reactflow";
import "reactflow/dist/style.css";
import { useQuery } from "urql";
import { ContentVersion } from "../gql/graphql";
import { pathToCurrentContent } from "../static/routeConfigs";
import FlowCanvas from "./FlowCanvas";
import { SPACE_FLOW_QUERY } from "./store/flowGraphql";
import { useFlowStore } from "./store/flowStore";
import { FlowState } from "./store/storeTypes";
import ToolBar from "./tool-bar/ToolBar";

const selector = (state: FlowState) => ({
  isCurrentUserOwner: state.isCurrentUserOwner,
  isInitialized: state.isInitialized,
  fetchFlowConfiguration: state.fetchFlowConfiguration,
});

export default function RouteFlow() {
  const navigate = useNavigate();

  // TODO: Properly handle spaceId not being present
  const { spaceId = "" } = useParams<{ spaceId: string }>();

  const { isCurrentUserOwner, isInitialized, fetchFlowConfiguration } =
    useFlowStore(selector);

  useEffect(() => {
    const subscription = fetchFlowConfiguration(spaceId);
    return () => {
      subscription.unsubscribe();
    };
  }, [fetchFlowConfiguration, spaceId]);

  const [queryResult] = useQuery({
    query: SPACE_FLOW_QUERY,
    requestPolicy: "network-only",
    variables: { spaceId },
  });

  useEffect(() => {
    if (queryResult.fetching) {
      return;
    }

    if (queryResult.error || !queryResult.data?.result) {
      return;
    }

    const contentVersion = queryResult.data.result.space.contentVersion;

    if (contentVersion !== ContentVersion.V2) {
      navigate(pathToCurrentContent(spaceId, contentVersion));
    }
  }, [
    navigate,
    queryResult.data,
    queryResult.error,
    queryResult.fetching,
    spaceId,
  ]);

  if (queryResult.fetching) {
    return <div>loading</div>;
  }

  if (queryResult.error || !queryResult.data?.result) {
    return <div>error</div>;
  }

  if (queryResult.data.result.space.contentVersion !== ContentVersion.V2) {
    return null;
  }

  return (
    <ReactFlowProvider>
      {isCurrentUserOwner && <ToolBar />}
      {isInitialized && <FlowCanvas />}
    </ReactFlowProvider>
  );
}
