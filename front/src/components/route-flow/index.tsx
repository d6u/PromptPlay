import posthog from "posthog-js";
import { useEffect } from "react";
import { useLoaderData, useParams } from "react-router-dom";
import { ReactFlowProvider } from "reactflow";
import "reactflow/dist/style.css";
import FlowCanvas from "./flow-canvas/FlowCanvas";
import FlowContext from "./FlowContext";
import { FlowLoaderData } from "./route-loader";
import { useFlowStore } from "./state/store-flow-state";
import { FlowState } from "./state/store-flow-state-types";
import ToolBar from "./tool-bar/ToolBar";

const selector = (state: FlowState) => ({
  initializeSpace: state.initializeSpace,
  deinitializeSpace: state.deinitializeSpace,
  isInitialized: state.isInitialized,
});

export default function RouteFlow() {
  const params = useParams<{ spaceId: string }>();
  const spaceId = params.spaceId!;

  const { isCurrentUserOwner } = useLoaderData() as FlowLoaderData;

  const { initializeSpace, deinitializeSpace, isInitialized } =
    useFlowStore(selector);

  useEffect(() => {
    initializeSpace(spaceId);

    return () => {
      deinitializeSpace();
    };
  }, [deinitializeSpace, initializeSpace, spaceId]);

  useEffect(() => {
    posthog.capture("Open Flow", { flowId: spaceId });
  }, [spaceId]);

  return (
    <FlowContext.Provider value={{ isCurrentUserOwner }}>
      <ReactFlowProvider>
        {isCurrentUserOwner && <ToolBar />}
        {isInitialized && <FlowCanvas />}
      </ReactFlowProvider>
    </FlowContext.Provider>
  );
}
