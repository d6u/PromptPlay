import { useContext } from 'react';
import RouteFlowContext from 'route-flow/common/RouteFlowContext';
import ReactFlowNode from '../ReactFlowNode';

export default function StandardNode() {
  const { isCurrentUserOwner } = useContext(RouteFlowContext);

  return <ReactFlowNode isNodeConfigReadOnly={!isCurrentUserOwner} />;
}
