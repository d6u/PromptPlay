import styled from '@emotion/styled';
import { useContext, useMemo } from 'react';
import { Position, useNodeId, useUpdateNodeInternals } from 'reactflow';
import invariant from 'tiny-invariant';

import {
  ConnectorType,
  InputNodeInstanceLevelConfig,
  NodeType,
} from 'flow-models';

import NodeVariablesEditableList from 'components/node-connector/NodeVariablesEditableList';
import RouteFlowContext from 'state-flow/context/FlowRouteContext';
import { useFlowStore } from 'state-flow/flow-store';
import { CanvasRightPanelType } from 'state-flow/types';
import { selectVariables } from 'state-flow/util/state-utils';

import NodeBox from '../node-box/NodeBox';
import NodeBoxHeaderSection from '../node-box/NodeBoxHeaderSection';

function InputNode() {
  const { isCurrentUserOwner } = useContext(RouteFlowContext);

  const nodeId = useNodeId();

  invariant(nodeId != null, 'nodeId is not null');

  const updateNodeInternals = useUpdateNodeInternals();

  // SECTION: Select state from store
  const setCanvasRightPaneType = useFlowStore((s) => s.setCanvasRightPaneType);
  const nodeConfigsDict = useFlowStore(
    (s) => s.getFlowContent().nodeConfigsDict,
  );
  const variablesDict = useFlowStore((s) => s.getFlowContent().variablesDict);
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
          isNodeReadOnly={!isCurrentUserOwner}
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
            showConnectorHandle={Position.Right}
            nodeId={nodeId}
            isNodeReadOnly={!isCurrentUserOwner}
            variableConfigs={flowInputVariables.map((variable) => ({
              id: variable.id,
              name: variable.name,
              isReadOnly: false,
            }))}
          />
        </GenericContainer>
      </NodeBox>
    </>
  );
}

const GenericContainer = styled.div`
  padding-left: 10px;
  padding-right: 10px;
`;

export default InputNode;
