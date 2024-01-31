import ReactFlowNode from 'canvas-react-flow/ReactFlowNode';
import { NodeType } from 'flow-models';
import { useContext } from 'react';
import RouteFlowContext from '../../../route-flow/common/RouteFlowContext';

export default function StandardNode() {
  const { isCurrentUserOwner } = useContext(RouteFlowContext);

  return (
    <ReactFlowNode
      isNodeConfigReadOnly={!isCurrentUserOwner}
      nodeType={NodeType.ChatGPTMessageNode}
      nodeTitle="ChatGPT Message"
      canAddVariable={true}
    />
  );
}
