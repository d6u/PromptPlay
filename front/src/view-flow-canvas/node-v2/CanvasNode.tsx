import type { NodeProps } from 'reactflow';
import NodeBoxV2 from './NodeBoxV2';
import NodeHeader from './NodeHeader';
import NodeInputVariables from './NodeInputVariables';

function CanvasNode(props: NodeProps) {
  return (
    <>
      <NodeBoxV2 selected={props.selected} nodeId={props.id}>
        <NodeHeader nodeId={props.id} />
        <NodeInputVariables nodeId={props.id} />
      </NodeBoxV2>
    </>
  );
}

export default CanvasNode;
