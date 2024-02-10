import { A } from '@mobily/ts-belt';
import { useContext, useMemo } from 'react';
import { useNodeId, useUpdateNodeInternals } from 'reactflow';

import {
  ConnectorType,
  NodeID,
  NodeType,
  OutputNodeInstanceLevelConfig,
} from 'flow-models';

import RouteFlowContext from 'state-flow/context/FlowRouteContext';
import { useFlowStore } from 'state-flow/context/FlowStoreContext';
import { CanvasRightPanelType } from 'state-flow/types';
import { selectVariables } from 'state-flow/util/state-utils';

import IncomingVariableHandle from '../handles/IncomingVariableHandle';
import NodeBox from '../node-box/NodeBox';
import NodeBoxHeaderSection from '../node-box/NodeBoxHeaderSection';
import { VARIABLE_LABEL_HEIGHT } from '../node-box/NodeBoxOutgoingVariableBlock';
import { ROW_MARGIN_TOP } from '../variables-editable-list/NodeBoxVariableEditableItem';
import NodeBoxVariablesEditableList from '../variables-editable-list/NodeBoxVariablesEditableList';

function OutputNode() {
  const { isCurrentUserOwner } = useContext(RouteFlowContext);

  const nodeId = useNodeId() as NodeID;
  const updateNodeInternals = useUpdateNodeInternals();

  const setCanvasRightPaneType = useFlowStore((s) => s.setCanvasRightPaneType);
  const nodeConfigsDict = useFlowStore((s) => s.nodeConfigsDict);
  const variablesDict = useFlowStore((s) => s.variablesDict);
  const removeNode = useFlowStore((s) => s.removeNode);
  const addVariable = useFlowStore((s) => s.addVariable);

  const nodeConfig = useMemo(
    () => nodeConfigsDict[nodeId] as OutputNodeInstanceLevelConfig | undefined,
    [nodeConfigsDict, nodeId],
  );

  const flowOutputs = useMemo(() => {
    return selectVariables(nodeId, ConnectorType.FlowOutput, variablesDict);
  }, [nodeId, variablesDict]);

  const inputVariableBlockHeightList = useMemo(() => {
    return A.make(flowOutputs.length, VARIABLE_LABEL_HEIGHT + ROW_MARGIN_TOP);
  }, [flowOutputs.length]);

  if (!nodeConfig) {
    return null;
  }

  return (
    <>
      {flowOutputs.map((output, i) => (
        <IncomingVariableHandle
          key={output.id}
          id={output.id}
          index={i}
          inputVariableBlockHeightList={inputVariableBlockHeightList}
        />
      ))}
      <NodeBox nodeType={NodeType.OutputNode}>
        <NodeBoxHeaderSection
          isReadOnly={!isCurrentUserOwner}
          title="Output"
          onClickRemove={() => {
            removeNode(nodeId);
          }}
          onClickGearButton={() => {
            setCanvasRightPaneType(CanvasRightPanelType.Tester);
          }}
          showAddVariableButton={true}
          onClickAddVariableButton={() => {
            addVariable(nodeId, ConnectorType.FlowOutput, flowOutputs.length);
            updateNodeInternals(nodeId);
          }}
        />
        <NodeBoxVariablesEditableList
          variables={flowOutputs.map((output) => ({
            id: output.id,
            name: output.name,
            isReadOnly: !isCurrentUserOwner,
          }))}
        />
      </NodeBox>
    </>
  );
}

export default OutputNode;
