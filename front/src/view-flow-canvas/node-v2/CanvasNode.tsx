import type { NodeProps } from 'reactflow';
import { useFlowStore } from 'state-flow/flow-store';
import NodeBoxV2 from './NodeBoxV2';
import NodeHeader from './NodeHeader';
import NodeInputVariables from './NodeInputVariables';
import NodeOutputVariables from './NodeOutputVariables';

function CanvasNode(props: NodeProps) {
  const configExists = useFlowStore(
    (s) => s.getFlowContent().nodeConfigs[props.id] != null,
  );

  // NOTE: Do this check so we don't have to check for null in every child
  // component. This happens when the node is deleted.
  if (!configExists) {
    return null;
  }

  return (
    <>
      <NodeBoxV2 selected={props.selected} nodeId={props.id}>
        <NodeHeader nodeId={props.id} />
        <NodeInputVariables nodeId={props.id} />
        <NodeOutputVariables nodeId={props.id} />
      </NodeBoxV2>
    </>
  );
}

export default CanvasNode;
