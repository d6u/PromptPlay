import ReactFlowNode from 'canvas-react-flow/ReactFlowNode';
import { useContext } from 'react';
import RouteFlowContext from '../../../route-flow/common/RouteFlowContext';

export default function StandardNode() {
  const { isCurrentUserOwner } = useContext(RouteFlowContext);

  return <ReactFlowNode isNodeConfigReadOnly={!isCurrentUserOwner} />;
}
