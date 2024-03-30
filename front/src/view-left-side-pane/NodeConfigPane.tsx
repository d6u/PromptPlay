import { useContext, useMemo } from 'react';
import invariant from 'tiny-invariant';

import { ConnectorType, NodeClass, NodeType } from 'flow-models';

import RouteFlowContext from 'state-flow/context/FlowRouteContext';
import { useFlowStore } from 'state-flow/flow-store';
import { selectVariables } from 'state-flow/util/state-utils';

import ConditionNodeConfigPane from './node-config-panes/ConditionNodeConfigPane';
import DefaultNodeConfigPane from './node-config-panes/DefaultNodeConfigPane';
import FinishClassNodeConfigPane from './node-config-panes/FinishClassNodeConfigPane';
import JavaScriptNodeConfigPane from './node-config-panes/JavaScriptNodeConfigPane';
import StartClassNodeConfigPane from './node-config-panes/StartClassNodeConfigPane';

function NodeConfigPane() {
  const { isCurrentUserOwner } = useContext(RouteFlowContext);
  const isReadOnly = !isCurrentUserOwner;

  const nodeId = useFlowStore((s) => s.canvasLeftPaneSelectedNodeId);

  invariant(nodeId != null, 'nodeId is not null');

  const nodeConfigs = useFlowStore((s) => s.getFlowContent().nodeConfigsDict);
  const connectors = useFlowStore((s) => s.getFlowContent().variablesDict);
  const nodeExecutionStates = useFlowStore(
    (s) => s.getFlowContent().nodeExecutionStates,
  );

  const nodeConfig = useMemo(() => nodeConfigs[nodeId], [nodeConfigs, nodeId]);

  const inputVariables = useMemo(() => {
    return selectVariables(nodeId, ConnectorType.NodeInput, connectors);
  }, [connectors, nodeId]);

  const outputVariables = useMemo(() => {
    return selectVariables(nodeId, ConnectorType.NodeOutput, connectors);
  }, [connectors, nodeId]);

  const nodeExecutionState = useMemo(() => {
    return nodeId != null ? nodeExecutionStates[nodeId] : null;
  }, [nodeId, nodeExecutionStates]);

  if (nodeConfig.class === NodeClass.Start) {
    return (
      <StartClassNodeConfigPane
        nodeId={nodeId}
        isNodeReadOnly={isReadOnly}
        nodeConfig={nodeConfig}
      />
    );
  } else if (nodeConfig.class === NodeClass.Finish) {
    return (
      <FinishClassNodeConfigPane
        nodeId={nodeId}
        isNodeReadOnly={isReadOnly}
        nodeConfig={nodeConfig}
      />
    );
  } else {
    switch (nodeConfig.type) {
      case NodeType.ConditionNode:
        return (
          <ConditionNodeConfigPane
            nodeId={nodeConfig.nodeId}
            isNodeReadOnly={isReadOnly}
            nodeConfig={nodeConfig}
            inputVariables={inputVariables}
            nodeExecutionState={nodeExecutionState}
          />
        );
      case NodeType.JavaScriptFunctionNode:
        return (
          <JavaScriptNodeConfigPane
            nodeId={nodeConfig.nodeId}
            isNodeReadOnly={isReadOnly}
            nodeConfig={nodeConfig}
            inputVariables={inputVariables}
            outputVariables={outputVariables}
            nodeExecutionState={nodeExecutionState}
          />
        );
      default:
        return (
          <DefaultNodeConfigPane
            nodeId={nodeConfig.nodeId}
            isNodeReadOnly={isReadOnly}
            nodeConfig={nodeConfig}
            inputVariables={inputVariables}
            outputVariables={outputVariables}
            nodeExecutionState={nodeExecutionState}
          />
        );
    }
  }
}

export default NodeConfigPane;
