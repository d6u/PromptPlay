import styled from '@emotion/styled';
import { useContext, useMemo } from 'react';
import { useNodeId, useUpdateNodeInternals } from 'reactflow';

import {
  ConnectorType,
  InputNodeInstanceLevelConfig,
  NodeID,
  NodeType,
} from 'flow-models';

import RouteFlowContext from 'state-flow/context/FlowRouteContext';
import { useFlowStore } from 'state-flow/context/FlowStoreContext';
import { CanvasRightPanelType } from 'state-flow/types';
import { selectVariables } from 'state-flow/util/state-utils';

import OutgoingVariableHandle from '../handles/OutgoingVariableHandle';
import NodeBox from '../node-box/NodeBox';
import NodeBoxHeaderSection from '../node-box/NodeBoxHeaderSection';
import NodeBoxOutgoingConnectorBlock from '../node-box/NodeBoxOutgoingConnectorBlock';

export default function InputNode() {
  const nodeId = useNodeId() as NodeID;

  const { isCurrentUserOwner } = useContext(RouteFlowContext);

  // SECTION: Select state from store

  const setCanvasRightPaneType = useFlowStore((s) => s.setCanvasRightPaneType);
  const nodeConfigsDict = useFlowStore((s) => s.nodeConfigsDict);
  const variablesDict = useFlowStore((s) => s.variablesDict);
  const removeNode = useFlowStore((s) => s.removeNode);
  const addVariable = useFlowStore((s) => s.addVariable);
  const updateVariable = useFlowStore((s) => s.updateVariable);
  const removeVariable = useFlowStore((s) => s.removeVariable);

  // !SECTION

  const flowInputs = useMemo(() => {
    return selectVariables(nodeId, ConnectorType.FlowInput, variablesDict);
  }, [nodeId, variablesDict]);

  const nodeConfig = useMemo(
    () => nodeConfigsDict[nodeId] as InputNodeInstanceLevelConfig | undefined,
    [nodeConfigsDict, nodeId],
  );

  const updateNodeInternals = useUpdateNodeInternals();

  if (!nodeConfig) {
    return null;
  }

  return (
    <>
      <NodeBox nodeType={NodeType.InputNode}>
        <NodeBoxHeaderSection
          isReadOnly={!isCurrentUserOwner}
          title="Input"
          onClickRemove={() => {
            removeNode(nodeId);
          }}
          onClickGearButton={() => {
            setCanvasRightPaneType(CanvasRightPanelType.Tester);
          }}
          showAddVariableButton={true}
          onClickAddVariableButton={() => {
            addVariable(nodeId, ConnectorType.FlowInput, flowInputs.length);
            updateNodeInternals(nodeId);
          }}
        />
        <NodeBoxFlowInputVariablesSection>
          {flowInputs.map((flowInput, i) => (
            <NodeBoxOutgoingConnectorBlock
              key={flowInput.id}
              name={flowInput.name}
              isReadOnly={!isCurrentUserOwner}
              onConfirmNameChange={(name) => {
                updateVariable(flowInput.id, { name });
              }}
              onRemove={() => {
                removeVariable(flowInput.id);
                updateNodeInternals(nodeId);
              }}
            />
          ))}
        </NodeBoxFlowInputVariablesSection>
      </NodeBox>
      {flowInputs.map((flowInput, i) => (
        <OutgoingVariableHandle
          key={flowInput.id}
          id={flowInput.id}
          index={i}
          totalVariableCount={flowInputs.length}
        />
      ))}
    </>
  );
}

const NodeBoxFlowInputVariablesSection = styled.div`
  padding-left: 10px;
  padding-right: 10px;
  margin-bottom: 10px;
`;
