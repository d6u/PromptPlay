import { useContext, useMemo } from 'react';
import { useNodeId } from 'reactflow';
import invariant from 'tiny-invariant';

import { NodeConfig } from 'flow-models';

import RouteFlowContext from 'state-flow/context/FlowRouteContext';
import { useFlowStore } from 'state-flow/context/FlowStoreContext';

import ReactFlowNode from '../node-box/ReactFlowNode';

export default function StandardNode() {
  const { isCurrentUserOwner } = useContext(RouteFlowContext);

  const nodeId = useNodeId();

  invariant(nodeId != null, 'nodeId is not null');

  const nodeConfigs = useFlowStore((s) => s.getFlowContent().nodeConfigsDict);
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
