import 'reactflow/dist/style.css';
import { useStore } from 'zustand';
import { useStoreFromFlowStoreContext } from '../store/FlowStoreContext';
import FlowCanvas from './flow-canvas/FlowCanvas';

export default function RouteCanvas() {
  const flowStore = useStoreFromFlowStoreContext();

  const isInitialized = useStore(flowStore, (s) => s.isInitialized);

  return <>{isInitialized && <FlowCanvas />}</>;
}
