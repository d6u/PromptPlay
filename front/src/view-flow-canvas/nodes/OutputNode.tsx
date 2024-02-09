import styled from '@emotion/styled';
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
import NodeBoxIncomingVariableBlock, {
  ROW_MARGIN_TOP,
} from '../node-box/NodeBoxIncomingVariableBlock';
import { VARIABLE_LABEL_HEIGHT } from '../node-box/NodeBoxOutgoingVariableBlock';

function OutputNode() {
  const { isCurrentUserOwner } = useContext(RouteFlowContext);

  const nodeId = useNodeId() as NodeID;
  const updateNodeInternals = useUpdateNodeInternals();

  const setCanvasRightPaneType = useFlowStore((s) => s.setCanvasRightPaneType);
  const nodeConfigsDict = useFlowStore((s) => s.nodeConfigsDict);
  const variablesDict = useFlowStore((s) => s.variablesDict);
  const removeNode = useFlowStore((s) => s.removeNode);
  const addVariable = useFlowStore((s) => s.addVariable);
  const updateVariable = useFlowStore((s) => s.updateVariable);
  const removeVariable = useFlowStore((s) => s.removeVariable);

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
        <NodeBoxFlowOutputVariablesSection>
          {flowOutputs.map((input, i) => (
            <NodeBoxIncomingVariableBlock
              key={input.id}
              name={input.name}
              isReadOnly={!isCurrentUserOwner}
              onConfirmNameChange={(name) => {
                updateVariable(input.id, { name });
              }}
              onRemove={() => {
                removeVariable(input.id);
                updateNodeInternals(nodeId);
              }}
            />
          ))}
        </NodeBoxFlowOutputVariablesSection>
      </NodeBox>
    </>
  );
}

const NodeBoxFlowOutputVariablesSection = styled.div`
  padding-left: 10px;
  padding-right: 10px;
  margin-bottom: 10px;
`;

export default OutputNode;
