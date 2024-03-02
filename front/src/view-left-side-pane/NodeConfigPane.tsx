import { useContext, useMemo } from 'react';
import invariant from 'tiny-invariant';

import { ConnectorType, NodeType } from 'flow-models';

import RouteFlowContext from 'state-flow/context/FlowRouteContext';
import { useFlowStore } from 'state-flow/flow-store';
import { selectVariables } from 'state-flow/util/state-utils';

import ConditionNodeConfigPanel from './node-config-panes/ConditionNodeConfigPane';
import DefaultNodeConfigPane from './node-config-panes/DefaultNodeConfigPane';
import InputNodeConfigPane from './node-config-panes/InputNodeConfigPane';
import JavaScriptNodeConfigPane from './node-config-panes/JavaScriptNodeConfigPane';
import OutputNodeConfigPane from './node-config-panes/OutputNodeConfigPane';

function NodeConfigPane() {
  const { isCurrentUserOwner } = useContext(RouteFlowContext);
  const isReadOnly = !isCurrentUserOwner;

  const nodeId = useFlowStore((s) => s.canvasLeftPaneSelectedNodeId);

  invariant(nodeId != null, 'nodeId is not null');

  const nodeConfigs = useFlowStore((s) => s.getFlowContent().nodeConfigsDict);
  const connectors = useFlowStore((s) => s.getFlowContent().variablesDict);

  const nodeConfig = useMemo(() => nodeConfigs[nodeId], [nodeConfigs, nodeId]);

  const inputVariables = useMemo(() => {
    return selectVariables(nodeId, ConnectorType.NodeInput, connectors);
  }, [connectors, nodeId]);

  const outputVariables = useMemo(() => {
    return selectVariables(nodeId, ConnectorType.NodeOutput, connectors);
  }, [connectors, nodeId]);

  switch (nodeConfig.type) {
    case NodeType.InputNode:
      return (
        <InputNodeConfigPane
          nodeId={nodeId}
          isReadOnly={isReadOnly}
          nodeConfig={nodeConfig}
        />
      );
    case NodeType.OutputNode:
      return (
        <OutputNodeConfigPane
          nodeId={nodeId}
          isReadOnly={isReadOnly}
          nodeConfig={nodeConfig}
        />
      );
    case NodeType.ConditionNode:
      return (
        <ConditionNodeConfigPanel
          nodeId={nodeConfig.nodeId}
          isReadOnly={isReadOnly}
          nodeConfig={nodeConfig}
          inputVariables={inputVariables}
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
        />
      );
    default:
      return (
        <DefaultNodeConfigPane
          nodeId={nodeConfig.nodeId}
          isReadOnly={isReadOnly}
          nodeConfig={nodeConfig}
          inputVariables={inputVariables}
          outputVariables={outputVariables}
        />
      );
  }
}

export default NodeConfigPane;
