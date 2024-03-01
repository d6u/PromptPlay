import styled from '@emotion/styled';
import { useContext, useMemo } from 'react';
import { Position, useNodeId, useUpdateNodeInternals } from 'reactflow';
import invariant from 'tiny-invariant';

import {
  ConnectorType,
  NodeType,
  OutputNodeInstanceLevelConfig,
} from 'flow-models';

import NodeVariablesEditableList from 'components/node-variables-editable-list/NodeVariablesEditableList';
import RouteFlowContext from 'state-flow/context/FlowRouteContext';
import { useFlowStore } from 'state-flow/flow-store';
import { CanvasRightPanelType } from 'state-flow/types';
import { selectVariables } from 'state-flow/util/state-utils';

import NodeBox from '../node-box/NodeBox';
import NodeBoxHeaderSection from '../node-box/NodeBoxHeaderSection';

function OutputNode() {
  const { isCurrentUserOwner } = useContext(RouteFlowContext);

  const nodeId = useNodeId();

  invariant(nodeId != null, 'nodeId is not null');

  const updateNodeInternals = useUpdateNodeInternals();

  const setCanvasRightPaneType = useFlowStore((s) => s.setCanvasRightPaneType);
  const nodeConfigsDict = useFlowStore(
    (s) => s.getFlowContent().nodeConfigsDict,
  );
  const variablesDict = useFlowStore((s) => s.getFlowContent().variablesDict);
  const removeNode = useFlowStore((s) => s.removeNode);
  const addVariable = useFlowStore((s) => s.addVariable);

  const nodeConfig = useMemo(
    () => nodeConfigsDict[nodeId] as OutputNodeInstanceLevelConfig | undefined,
    [nodeConfigsDict, nodeId],
  );

  const flowOutputs = useMemo(() => {
    return selectVariables(nodeId, ConnectorType.FlowOutput, variablesDict);
  }, [nodeId, variablesDict]);

  if (!nodeConfig) {
    return null;
  }

  return (
    <>
      <NodeBox nodeType={NodeType.OutputNode}>
        <NodeBoxHeaderSection
          isNodeReadOnly={!isCurrentUserOwner}
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
        <GenericContainer>
          <NodeVariablesEditableList
            showConnectorHandle={Position.Left}
            nodeId={nodeId}
            isNodeReadOnly={!isCurrentUserOwner}
            variableConfigs={flowOutputs.map((output) => ({
              id: output.id,
              name: output.name,
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

export default OutputNode;
