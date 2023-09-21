import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { ReactFlowProvider } from "reactflow";
import "reactflow/dist/style.css";
import FlowCanvas from "./FlowCanvas";
import { useFlowStore } from "./store/flowStore";
import { FlowState } from "./store/flowStore";
import ToolBar from "./tool-bar/ToolBar";

const selector = (state: FlowState) => ({
  isCurrentUserOwner: state.isCurrentUserOwner,
  isInitialized: state.isInitialized,
  fetchFlowConfiguration: state.fetchFlowConfiguration,
});

export default function RouteFlow() {
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

  return (
    <ReactFlowProvider>
      {isCurrentUserOwner && <ToolBar />}
      {isInitialized && <FlowCanvas />}
    </ReactFlowProvider>
  );
}
