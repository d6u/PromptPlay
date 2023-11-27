import posthog from "posthog-js";
import { useEffect } from "react";
import { useLoaderData, useParams } from "react-router-dom";
import { ReactFlowProvider } from "reactflow";
import "reactflow/dist/style.css";
import invariant from "ts-invariant";
import { useStore } from "zustand";
import FlowCanvas from "./flow-canvas/FlowCanvas";
import FlowContext from "./FlowContext";
import { FlowLoaderData } from "./route-loader";
import { useStoreFromFlowStoreContext } from "./store/FlowStoreContext";
import FlowStoreContextManager from "./store/FlowStoreContextManager";
import ToolBar from "./tool-bar/ToolBar";

export default function RouteFlow() {
  const spaceId = useParams<{ spaceId: string }>().spaceId;
  invariant(spaceId != null);

  useEffect(() => {
    posthog.capture("Open Flow", { flowId: spaceId });
  }, [spaceId]);

  return (
    <FlowStoreContextManager spaceId={spaceId}>
      <ReactFlowProvider>
        <RouteFlowInner />
      </ReactFlowProvider>
    </FlowStoreContextManager>
  );
}

function RouteFlowInner() {
  const { isCurrentUserOwner } = useLoaderData() as FlowLoaderData;

  const flowStore = useStoreFromFlowStoreContext();

  const isInitialized = useStore(flowStore, (s) => s.isInitialized);

  return (
    <FlowContext.Provider value={{ isCurrentUserOwner }}>
      {isCurrentUserOwner && <ToolBar />}
      {isInitialized && <FlowCanvas />}
    </FlowContext.Provider>
  );
}
