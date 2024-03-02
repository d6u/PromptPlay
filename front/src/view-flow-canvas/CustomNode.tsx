import { Option } from '@mobily/ts-belt';
import { useContext, useMemo } from 'react';
import { useNodeId } from 'reactflow';

import { ConnectorType, NodeConfig, NodeType } from 'flow-models';

import RouteFlowContext from 'state-flow/context/FlowRouteContext';
import { useFlowStore } from 'state-flow/flow-store';
import {
  selectConditionTarget,
  selectVariables,
} from 'state-flow/util/state-utils';

import invariant from 'tiny-invariant';
import DefaultNode from './node-box/DefaultNode';
import ConditionNode from './nodes/ConditionNode';
import InputNode from './nodes/InputNode';
import JavaScriptFunctionNode from './nodes/JavaScriptFunctionNode';
import OutputNode from './nodes/OutputNode';

function CustomNode() {
  const { isCurrentUserOwner } = useContext(RouteFlowContext);

  const nodeId = useNodeId();

  const nodeConfigs = useFlowStore((s) => s.getFlowContent().nodeConfigsDict);
  const variablesDict = useFlowStore((s) => s.getFlowContent().variablesDict);

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

  if (nodeId == null || nodeConfig == null) {
    return null;
  }

  switch (nodeConfig.type) {
    case NodeType.InputNode:
      return <InputNode />;
    case NodeType.OutputNode:
      return <OutputNode />;
    case NodeType.ConditionNode:
      return <ConditionNode />;
    case NodeType.JavaScriptFunctionNode:
      return <JavaScriptFunctionNode />;
    default:
      invariant(conditionTarget != null, 'conditionTarget is not null');

      return (
        <DefaultNode
          nodeId={nodeId}
          isNodeConfigReadOnly={!isCurrentUserOwner}
          nodeConfig={nodeConfig}
          inputVariables={inputVariables}
          outputVariables={outputVariables}
          conditionTarget={conditionTarget}
        />
      );
  }
}

export default CustomNode;
