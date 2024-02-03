import 'reactflow/dist/style.css';
import { useStoreFromFlowStoreContext } from 'route-flow/store/FlowStoreContext';
import FlowCanvas from 'view-flow-canvas/FlowCanvas';
import { useStore } from 'zustand';

export default function RouteCanvas() {
  const flowStore = useStoreFromFlowStoreContext();

  const isInitialized = useStore(flowStore, (s) => s.isInitialized);

  return <>{isInitialized && <FlowCanvas />}</>;
}
