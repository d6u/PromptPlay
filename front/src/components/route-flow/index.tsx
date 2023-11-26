import posthog from "posthog-js";
import { useEffect, useRef } from "react";
import { useLoaderData, useParams } from "react-router-dom";
import { ReactFlowProvider } from "reactflow";
import "reactflow/dist/style.css";
import invariant from "ts-invariant";
import { useStore } from "zustand";
import FlowCanvas from "./flow-canvas/FlowCanvas";
import FlowContext from "./FlowContext";
import { FlowLoaderData } from "./route-loader";
import { createFlowStore } from "./state/store-flow-state";
import ToolBar from "./tool-bar/ToolBar";

export default function RouteFlow() {
  const params = useParams<{ spaceId: string }>();
  const spaceId = params.spaceId;
  invariant(spaceId != null);

  const { isCurrentUserOwner } = useLoaderData() as FlowLoaderData;

  const flowStore = useRef(createFlowStore({ spaceId })).current;

  const initializeSpace = useStore(flowStore, (s) => s.initializeSpace);
  const deinitializeSpace = useStore(flowStore, (s) => s.deinitializeSpace);
  const isInitialized = useStore(flowStore, (s) => s.isInitialized);

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
    <FlowContext.Provider value={{ flowStore, isCurrentUserOwner }}>
      <ReactFlowProvider>
        {isCurrentUserOwner && <ToolBar />}
        {isInitialized && <FlowCanvas />}
      </ReactFlowProvider>
    </FlowContext.Provider>
  );
}
