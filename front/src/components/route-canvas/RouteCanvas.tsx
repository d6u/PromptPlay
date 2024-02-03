import 'reactflow/dist/style.css';
import { useStoreFromFlowStoreContext } from 'route-flow/store/FlowStoreContext';
import { useStore } from 'zustand';
import FlowCanvas from './flow-canvas/FlowCanvas';

export default function RouteCanvas() {
  const flowStore = useStoreFromFlowStoreContext();

  const isInitialized = useStore(flowStore, (s) => s.isInitialized);

  return <>{isInitialized && <FlowCanvas />}</>;
}
