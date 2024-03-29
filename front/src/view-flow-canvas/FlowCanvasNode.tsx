import { Option } from '@mobily/ts-belt';
import { useContext, useMemo } from 'react';
import { useNodeId } from 'reactflow';

import { ConnectorType, NodeClass, NodeConfig, NodeType } from 'flow-models';

import RouteFlowContext from 'state-flow/context/FlowRouteContext';
import { useFlowStore } from 'state-flow/flow-store';
import {
  selectConditionTarget,
  selectVariables,
} from 'state-flow/util/state-utils';

import invariant from 'tiny-invariant';
import ConditionNode from './nodes/ConditionNode';
import DefaultNode from './nodes/DefaultNode';
import JavaScriptFunctionNode from './nodes/JavaScriptFunctionNode';
import OutputNode from './nodes/OutputNode';
import StartClassNode from './nodes/StartClassNode';

function FlowCanvasNode() {
  const { isCurrentUserOwner } = useContext(RouteFlowContext);
  const isNodeReadOnly = !isCurrentUserOwner;

  const nodeId = useNodeId();

  const nodeConfigs = useFlowStore((s) => s.getFlowContent().nodeConfigsDict);
  const variablesDict = useFlowStore((s) => s.getFlowContent().variablesDict);
  const nodeExecutionStates = useFlowStore(
    (s) => s.getFlowContent().nodeExecutionStates,
  );

  let nodeConfig: Option<NodeConfig> = null;

  if (nodeId != null) {
    nodeConfig = nodeConfigs[nodeId];
  }

  const inputVariables = useMemo(() => {
    if (nodeId != null) {
      return selectVariables(nodeId, ConnectorType.NodeInput, variablesDict);
    } else {
      return [];
    }
  }, [nodeId, variablesDict]);

  const outputVariables = useMemo(() => {
    if (nodeId != null) {
      return selectVariables(nodeId, ConnectorType.NodeOutput, variablesDict);
    } else {
      return [];
    }
  }, [nodeId, variablesDict]);

  const conditionTarget = useMemo(() => {
    if (nodeId == null) {
      return null;
    }
    return selectConditionTarget(nodeId, variablesDict);
  }, [nodeId, variablesDict]);

  const nodeExecutionState = useMemo(() => {
    if (nodeId == null) {
      return null;
    }
    return nodeExecutionStates[nodeId];
  }, [nodeId, nodeExecutionStates]);

  if (nodeId == null || nodeConfig == null) {
    return null;
  }

  if (nodeConfig.class === NodeClass.Start) {
    if (
      nodeConfig.type === NodeType.InputNode ||
      nodeConfig.type === NodeType.GenericChatbotStart
    ) {
      return (
        <StartClassNode
          nodeId={nodeId}
          isNodeReadOnly={isNodeReadOnly}
          nodeConfig={nodeConfig}
        />
      );
    }
  } else if (nodeConfig.class === NodeClass.Finish) {
    invariant(conditionTarget != null, 'conditionTarget is not null');

    if (nodeConfig.type === NodeType.OutputNode) {
      return (
        <OutputNode
          nodeId={nodeId}
          isNodeReadOnly={isNodeReadOnly}
          nodeConfig={nodeConfig}
          conditionTarget={conditionTarget}
        />
      );
    }
  } else {
    invariant(conditionTarget != null, 'conditionTarget is not null');

    if (nodeConfig.type === NodeType.ConditionNode) {
      return (
        <ConditionNode
          nodeId={nodeId}
          isNodeReadOnly={isNodeReadOnly}
          nodeConfig={nodeConfig}
          inputVariables={inputVariables}
          conditionTarget={conditionTarget}
          nodeExecutionState={nodeExecutionState}
        />
      );
    } else if (nodeConfig.type === NodeType.JavaScriptFunctionNode) {
      return (
        <JavaScriptFunctionNode
          nodeId={nodeId}
          isNodeReadOnly={isNodeReadOnly}
          nodeConfig={nodeConfig}
          inputVariables={inputVariables}
          outputVariables={outputVariables}
          conditionTarget={conditionTarget}
          nodeExecutionState={nodeExecutionState}
        />
      );
    } else {
      return (
        <DefaultNode
          nodeId={nodeId}
          isNodeReadOnly={isNodeReadOnly}
          nodeConfig={nodeConfig}
          inputVariables={inputVariables}
          outputVariables={outputVariables}
          conditionTarget={conditionTarget}
          nodeExecutionState={nodeExecutionState}
        />
      );
    }
  }
}

export default FlowCanvasNode;
