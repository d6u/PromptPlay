import { useEffect } from "react";
import { useLoaderData, useParams } from "react-router-dom";
import { ReactFlowProvider } from "reactflow";
import "reactflow/dist/style.css";
import FlowCanvas from "./FlowCanvas";
import FlowContext from "./flowContext";
import { FlowLoaderData } from "./flowLoader";
import { FlowState, useFlowStore } from "./store/flowStore";
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

  return (
    <FlowContext.Provider value={{ isCurrentUserOwner }}>
      <ReactFlowProvider>
        {isCurrentUserOwner && <ToolBar />}
        {isInitialized && <FlowCanvas />}
      </ReactFlowProvider>
    </FlowContext.Provider>
  );
}
