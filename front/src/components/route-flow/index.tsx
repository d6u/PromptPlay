import posthog from "posthog-js";
import { useEffect } from "react";
import { useLoaderData, useParams } from "react-router-dom";
import { ReactFlowProvider } from "reactflow";
import "reactflow/dist/style.css";
import invariant from "ts-invariant";
import FlowCanvas from "./flow-canvas/FlowCanvas";
import FlowContext from "./FlowContext";
import { FlowLoaderData } from "./route-loader";
import { useFlowStore } from "./state/store-flow-state";
import ToolBar from "./tool-bar/ToolBar";

export default function RouteFlow() {
  const params = useParams<{ spaceId: string }>();
  const spaceId = params.spaceId;
  invariant(spaceId != null);

  const { isCurrentUserOwner } = useLoaderData() as FlowLoaderData;

  const initializeSpace = useFlowStore.use.initializeSpace();
  const deinitializeSpace = useFlowStore.use.deinitializeSpace();
  const isInitialized = useFlowStore.use.isInitialized();

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
