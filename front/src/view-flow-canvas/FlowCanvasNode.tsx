import { Option } from '@mobily/ts-belt';
import { useContext, useMemo } from 'react';
import { type NodeProps } from 'reactflow';

import { ConnectorType, NodeClass, NodeConfig, NodeType } from 'flow-models';

import RouteFlowContext from 'state-flow/context/FlowRouteContext';
import { useFlowStore } from 'state-flow/flow-store';
import {
  selectConditionTarget,
  selectVariables,
} from 'state-flow/util/state-utils';

import invariant from 'tiny-invariant';
import DefaultNode from './nodes/DefaultNode';
import FinishClassNode from './nodes/FinishClassNode';
import JSONataConditionNode from './nodes/JSONataConditionNode';
import JavaScriptFunctionNode from './nodes/JavaScriptFunctionNode';
import LoopFinishNode from './nodes/LoopFinishNode';
import StartClassNode from './nodes/StartClassNode';

function FlowCanvasNode(props: NodeProps) {
  const { id: nodeId, selected } = props;

  const { isCurrentUserOwner } = useContext(RouteFlowContext);
  const isNodeReadOnly = !isCurrentUserOwner;

  const nodeConfigs = useFlowStore((s) => s.getFlowContent().nodeConfigs);
  const connectors = useFlowStore((s) => s.getFlowContent().connectors);
  const nodeExecutionStates = useFlowStore(
    (s) => s.getFlowContent().nodeExecutionStates,
  );

  let nodeConfig: Option<NodeConfig> = null;

  if (nodeId != null) {
    nodeConfig = nodeConfigs[nodeId];
  }

  const inputVariables = useMemo(() => {
    if (nodeId != null) {
      return selectVariables(nodeId, ConnectorType.NodeInput, connectors);
    } else {
      return [];
    }
  }, [nodeId, connectors]);

  const outputVariables = useMemo(() => {
    if (nodeId != null) {
      return selectVariables(nodeId, ConnectorType.NodeOutput, connectors);
    } else {
      return [];
    }
  }, [nodeId, connectors]);

  const conditionTarget = useMemo(() => {
    if (nodeId == null) {
      return null;
    }
    return selectConditionTarget(nodeId, connectors);
  }, [nodeId, connectors]);

  const nodeExecutionState = useMemo(() => {
    if (nodeId == null) {
      return null;
    }
    return nodeExecutionStates[nodeId];
  }, [nodeId, nodeExecutionStates]);

  if (nodeId == null || nodeConfig == null) {
    return null;
  }

  // NOTE: Start or SubroutineStart

  if (
    nodeConfig.class === NodeClass.Start ||
    nodeConfig.class === NodeClass.SubroutineStart
  ) {
    return (
      <StartClassNode
        selected={selected}
        nodeId={nodeId}
        isNodeReadOnly={isNodeReadOnly}
        nodeConfig={nodeConfig}
      />
    );
  }

  // NOTE: Finish

  if (nodeConfig.class === NodeClass.Finish) {
    if (nodeConfig.type === NodeType.LoopFinish) {
      return (
        <LoopFinishNode
          selected={selected}
          nodeId={nodeId}
          isNodeReadOnly={isNodeReadOnly}
          nodeConfig={nodeConfig}
        />
      );
    }

    invariant(conditionTarget != null, 'conditionTarget is not null');
    return (
      <FinishClassNode
        selected={selected}
        nodeId={nodeId}
        isNodeReadOnly={isNodeReadOnly}
        nodeConfig={nodeConfig}
        incomingCondition={conditionTarget}
      />
    );
  }

  // NOTE: Condition

  if (nodeConfig.class === NodeClass.Condition) {
    if (nodeConfig.type === NodeType.JSONataCondition) {
      invariant(conditionTarget != null, 'conditionTarget is not null');
      return (
        <JSONataConditionNode
          selected={selected}
          nodeId={nodeId}
          isNodeReadOnly={isNodeReadOnly}
          nodeConfig={nodeConfig}
          inputVariables={inputVariables}
          incomingCondition={conditionTarget}
          nodeExecutionState={nodeExecutionState}
        />
      );
    }
  }

  // NOTE: Process or Subroutine

  if (nodeConfig.type === NodeType.JavaScriptFunctionNode) {
    invariant(conditionTarget != null, 'conditionTarget is not null');
    return (
      <JavaScriptFunctionNode
        selected={selected}
        nodeId={nodeId}
        isNodeReadOnly={isNodeReadOnly}
        nodeConfig={nodeConfig}
        inputVariables={inputVariables}
        outputVariables={outputVariables}
        incomingCondition={conditionTarget}
        nodeExecutionState={nodeExecutionState}
      />
    );
  }

  invariant(conditionTarget != null, 'conditionTarget is not null');
  return (
    <DefaultNode
      selected={selected}
      nodeId={nodeId}
      isNodeReadOnly={isNodeReadOnly}
      nodeConfig={nodeConfig}
      inputVariables={inputVariables}
      outputVariables={outputVariables}
      incomingCondition={conditionTarget}
      nodeExecutionState={nodeExecutionState}
    />
  );
}

export default FlowCanvasNode;
