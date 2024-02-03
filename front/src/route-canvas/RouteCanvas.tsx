import 'reactflow/dist/style.css';
import { useFlowStore } from 'state-flow/context/FlowStoreContext';
import FlowCanvasView from 'view-flow-canvas/FlowCanvasView';

export default function RouteCanvas() {
  const isInitialized = useFlowStore((s) => s.isInitialized);

  return <>{isInitialized && <FlowCanvasView />}</>;
}
