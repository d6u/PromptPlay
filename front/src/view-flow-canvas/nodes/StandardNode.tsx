import { NodeID } from 'flow-models';
import { useContext, useMemo } from 'react';
import { useNodeId } from 'reactflow';
import RouteFlowContext from 'state-flow/context/FlowRouteContext';
import { useFlowStore } from 'state-flow/context/FlowStoreContext';
import ReactFlowNode from './ReactFlowNode';

export default function StandardNode() {
  const { isCurrentUserOwner } = useContext(RouteFlowContext);

  const nodeId = useNodeId() as NodeID;
  const nodeConfigsDict = useFlowStore((s) => s.nodeConfigsDict);
  const nodeConfig = useMemo(() => {
    return nodeConfigsDict[nodeId];
  }, [nodeConfigsDict, nodeId]);

  if (!nodeConfig) {
    // In ReactFlowNode, we assume the target nodeConfig is not null.
    //
    // When deleting a node, there is a small delay between
    // deleting the nodeConfig and unmounting the node component,
    // which could cause errors due to nodeConfig being null.
    return null;
  }

  return <ReactFlowNode isNodeConfigReadOnly={!isCurrentUserOwner} />;
}
