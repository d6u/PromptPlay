import styled from '@emotion/styled';
import { useContext, useMemo } from 'react';
import { useNodeId, useUpdateNodeInternals } from 'reactflow';

import {
  ConnectorType,
  InputNodeInstanceLevelConfig,
  NodeID,
  NodeType,
} from 'flow-models';

import NodeVariablesEditableList from 'components/node-variables-editable-list/NodeVariablesEditableList';
import RouteFlowContext from 'state-flow/context/FlowRouteContext';
import { useFlowStore } from 'state-flow/context/FlowStoreContext';
import { CanvasRightPanelType } from 'state-flow/types';
import { selectVariables } from 'state-flow/util/state-utils';

import OutgoingVariableHandle from '../handles/OutgoingVariableHandle';
import NodeBox from '../node-box/NodeBox';
import NodeBoxHeaderSection from '../node-box/NodeBoxHeaderSection';

function InputNode() {
  const { isCurrentUserOwner } = useContext(RouteFlowContext);

  const nodeId = useNodeId() as NodeID;
  const updateNodeInternals = useUpdateNodeInternals();

  // SECTION: Select state from store
  const setCanvasRightPaneType = useFlowStore((s) => s.setCanvasRightPaneType);
  const nodeConfigsDict = useFlowStore((s) => s.nodeConfigsDict);
  const variablesDict = useFlowStore((s) => s.variablesDict);
  const removeNode = useFlowStore((s) => s.removeNode);
  const addVariable = useFlowStore((s) => s.addVariable);
  // !SECTION

  const flowInputVariables = useMemo(() => {
    return selectVariables(nodeId, ConnectorType.FlowInput, variablesDict);
  }, [nodeId, variablesDict]);

  const nodeConfig = useMemo(
    () => nodeConfigsDict[nodeId] as InputNodeInstanceLevelConfig | undefined,
    [nodeConfigsDict, nodeId],
  );

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
            addVariable(
              nodeId,
              ConnectorType.FlowInput,
              flowInputVariables.length,
            );
            updateNodeInternals(nodeId);
          }}
        />
        <GenericContainer>
          <NodeVariablesEditableList
            variableConfigs={flowInputVariables.map((variable) => ({
              id: variable.id,
              name: variable.name,
              isReadOnly: !isCurrentUserOwner,
            }))}
          />
        </GenericContainer>
      </NodeBox>
      {flowInputVariables.map((flowInput, i) => (
        <OutgoingVariableHandle
          key={flowInput.id}
          id={flowInput.id}
          index={i}
          totalVariableCount={flowInputVariables.length}
        />
      ))}
    </>
  );
}

const GenericContainer = styled.div`
  padding-left: 10px;
  padding-right: 10px;
`;

export default InputNode;
