import styled from "@emotion/styled";
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ReactFlowProvider } from "reactflow";
import "reactflow/dist/style.css";
import { useQuery } from "urql";
import { ContentVersion } from "../gql/graphql";
import { pathToCurrentContent } from "../static/routeConfigs";
import FlowCanvas from "./FlowCanvas";
import { SPACE_FLOW_QUERY } from "./flowGraphql";
import { FlowState, useFlowStore } from "./flowState";

const Container = styled.div`
  flex-grow: 1;
  position: relative;
  min-height: 0;
`;

const selector = (state: FlowState) => ({
  isInitialized: state.isInitialized,
  fetchFlowConfiguration: state.fetchFlowConfiguration,
});

export default function RouteFlow() {
  const navigate = useNavigate();

  // TODO: Properly handle spaceId not being present
  const { spaceId = "" } = useParams<{ spaceId: string }>();

  const { isInitialized, fetchFlowConfiguration } = useFlowStore(selector);

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
    <Container>
      <ReactFlowProvider>{isInitialized && <FlowCanvas />}</ReactFlowProvider>
    </Container>
  );
}
