import { useContext } from 'react';
import RouteFlowContext from 'state-flow/context/FlowRouteContext';
import ReactFlowNode from './ReactFlowNode';

export default function StandardNode() {
  const { isCurrentUserOwner } = useContext(RouteFlowContext);

  return <ReactFlowNode isNodeConfigReadOnly={!isCurrentUserOwner} />;
}
