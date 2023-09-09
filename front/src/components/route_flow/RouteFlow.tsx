import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { ReactFlowProvider } from "reactflow";
import "reactflow/dist/style.css";
import styled from "styled-components";
import FlowCanvas from "./FlowCanvas";
import { FlowState, useFlowStore } from "./flowState";

const Container = styled.div`
  flex-grow: 1;
  position: relative;
`;

const selector = (state: FlowState) => ({
  isInitialized: state.isInitialized,
  fetchFlowConfiguration: state.fetchFlowConfiguration,
});

export default function RouteFlow() {
  // TODO: Properly handle spaceId not being present
  const { spaceId = "" } = useParams<{ spaceId: string }>();

  const { isInitialized, fetchFlowConfiguration } = useFlowStore(selector);

  useEffect(() => {
    const subscription = fetchFlowConfiguration(spaceId);
    return () => {
      subscription.unsubscribe();
    };
  }, [fetchFlowConfiguration, spaceId]);

  return (
    <Container>
      <ReactFlowProvider>{isInitialized && <FlowCanvas />}</ReactFlowProvider>
    </Container>
  );
}
