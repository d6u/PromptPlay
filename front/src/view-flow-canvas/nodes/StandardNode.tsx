import { useContext, useMemo } from 'react';
import { useNodeId } from 'reactflow';

import { NodeConfig, NodeID } from 'flow-models';

import RouteFlowContext from 'state-flow/context/FlowRouteContext';
import { useFlowStore } from 'state-flow/context/FlowStoreContext';

import ReactFlowNode from './ReactFlowNode';

export default function StandardNode() {
  const { isCurrentUserOwner } = useContext(RouteFlowContext);

  const nodeId = useNodeId() as NodeID;
  const nodeConfigs = useFlowStore((s) => s.nodeConfigsDict);
  const nodeConfig = useMemo(() => {
    return nodeConfigs[nodeId] as NodeConfig | undefined;
  }, [nodeConfigs, nodeId]);

  if (!nodeConfig) {
    return null;
  }

  return (
    <ReactFlowNode
      isNodeConfigReadOnly={!isCurrentUserOwner}
      nodeConfig={nodeConfig}
    />
  );
}
