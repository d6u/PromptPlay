import { useContext, useMemo } from 'react';
import invariant from 'tiny-invariant';

import { ConnectorType, NodeKind, NodeType } from 'flow-models';

import RouteFlowContext from 'state-flow/context/FlowRouteContext';
import { useFlowStore } from 'state-flow/flow-store';
import { selectVariables } from 'state-flow/util/state-utils';

import DefaultNodeConfigPane from './node-config-panes/DefaultNodeConfigPane';
import FinishClassNodeConfigPane from './node-config-panes/FinishClassNodeConfigPane';
import JSONataConditionNodeConfigPane from './node-config-panes/JSONataConditionNodeConfigPane';
import JavaScriptNodeConfigPane from './node-config-panes/JavaScriptNodeConfigPane';
import StartClassNodeConfigPane from './node-config-panes/StartClassNodeConfigPane';

function NodeConfigPane() {
  const { isCurrentUserOwner } = useContext(RouteFlowContext);
  const isReadOnly = !isCurrentUserOwner;

  const nodeId = useFlowStore((s) => s.canvasLeftPaneSelectedNodeId);

  invariant(nodeId != null, 'nodeId is not null');

  const nodeConfigs = useFlowStore((s) => s.getFlowContent().nodeConfigs);
  const connectors = useFlowStore((s) => s.getFlowContent().connectors);
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

  // NOTE: Start or SubroutineStart

  if (
    nodeConfig.kind === NodeKind.Start ||
    nodeConfig.kind === NodeKind.SubroutineStart
  ) {
    return (
      <StartClassNodeConfigPane
        nodeId={nodeId}
        isNodeReadOnly={isReadOnly}
        nodeConfig={nodeConfig}
      />
    );
  }

  // NOTE: Finish

  if (nodeConfig.kind === NodeKind.Finish) {
    return (
      <FinishClassNodeConfigPane
        nodeId={nodeId}
        isNodeReadOnly={isReadOnly}
        nodeConfig={nodeConfig}
      />
    );
  }

  // NOTE: Condition, Subroutine, JavaScriptFunction

  switch (nodeConfig.type) {
    case NodeType.JSONataCondition:
      return (
        <JSONataConditionNodeConfigPane
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

export default NodeConfigPane;
