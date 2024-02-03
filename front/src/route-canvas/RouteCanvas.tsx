import 'reactflow/dist/style.css';
import { useStoreFromFlowStoreContext } from 'state-flow/context/FlowStoreContext';
import FlowCanvasView from 'view-flow-canvas/FlowCanvasView';
import { useStore } from 'zustand';

export default function RouteCanvas() {
  const flowStore = useStoreFromFlowStoreContext();

  const isInitialized = useStore(flowStore, (s) => s.isInitialized);

  return <>{isInitialized && <FlowCanvasView />}</>;
}
