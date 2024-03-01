import styled from '@emotion/styled';
import { ReactNode, useContext, useMemo } from 'react';
import { useUpdateNodeInternals } from 'reactflow';
import invariant from 'tiny-invariant';

import {
  ConnectorType,
  NodeType,
  getNodeDefinitionForNodeTypeName,
} from 'flow-models';

import NodeVariablesEditableList from 'components/node-variables-editable-list/NodeVariablesEditableList';
import HeaderSection from 'components/side-pane/SidePaneHeaderSection';
import HeaderSectionHeader from 'components/side-pane/SidePaneHeaderSectionHeader';
import SidePaneOutputRenderer from 'components/side-pane/SidePaneOutputRenderer';
import Section from 'components/side-pane/SidePaneSection';
import RouteFlowContext from 'state-flow/context/FlowRouteContext';
import { useFlowStore } from 'state-flow/flow-store';
import { selectVariables } from 'state-flow/util/state-utils';
import NodeBoxAddConnectorButton from 'view-flow-canvas/node-box/NodeBoxAddConnectorButton';

import ConditionNodeConfigPanel from './ConditionNodeConfigPanel';
import NodeConfigPaneNodeFields from './NodeConfigPaneNodeFields';

function NodeConfigPane() {
  const { isCurrentUserOwner } = useContext(RouteFlowContext);

  const updateNodeInternals = useUpdateNodeInternals();

  const nodeConfigs = useFlowStore((s) => s.getFlowContent().nodeConfigsDict);
  const variables = useFlowStore((s) => s.getFlowContent().variablesDict);
  const selectedNodeId = useFlowStore((s) => s.canvasLeftPaneSelectedNodeId);
  const addVariable = useFlowStore((s) => s.addVariable);

  const nodeConfig = useMemo(() => {
    return nodeConfigs[selectedNodeId!];
  }, [nodeConfigs, selectedNodeId]);

  const nodeDefinition = useMemo(() => {
    return getNodeDefinitionForNodeTypeName(nodeConfig.type);
  }, [nodeConfig.type]);

  const outputVariables = useMemo(() => {
    return selectedNodeId == null
      ? []
      : selectVariables(selectedNodeId, ConnectorType.NodeOutput, variables);
  }, [variables, selectedNodeId]);

  const incomingVariables = useMemo(() => {
    return selectedNodeId == null
      ? []
      : selectVariables(selectedNodeId, ConnectorType.NodeInput, variables).map(
          (variable) => {
            const incomingVariableConfig =
              nodeDefinition.fixedIncomingVariables?.[variable.name];

            return {
              id: variable.id,
              name: variable.name,
              isReadOnly: !isCurrentUserOwner || incomingVariableConfig != null,
              helperText: incomingVariableConfig?.helperMessage,
            };
          },
        );
  }, [
    selectedNodeId,
    variables,
    nodeDefinition.fixedIncomingVariables,
    isCurrentUserOwner,
  ]);

  invariant(nodeConfig != null, 'nodeConfig is not null');

  let content: ReactNode;
  switch (nodeConfig.type) {
    case NodeType.InputNode: {
      throw new Error('Not implemented yet: NodeType.InputNode case');
    }
    case NodeType.OutputNode: {
      throw new Error('Not implemented yet: NodeType.OutputNode case');
    }
    case NodeType.ConditionNode:
      content = (
        <ConditionNodeConfigPanel
          isReadOnly={!isCurrentUserOwner}
          nodeConfig={nodeConfig}
        />
      );
      break;
    case NodeType.JavaScriptFunctionNode:
      // TODO: Implement
      content = null;
      break;
    default:
      content = (
        <>
          <HeaderSection>
            <HeaderSectionHeader>
              {nodeDefinition.label} Config
            </HeaderSectionHeader>
          </HeaderSection>
          {nodeDefinition.canUserAddIncomingVariables && (
            <AddConnectorButtonSection>
              <NodeBoxAddConnectorButton
                label="Variable"
                onClick={() => {
                  addVariable(
                    nodeConfig.nodeId,
                    ConnectorType.NodeInput,
                    incomingVariables.length,
                  );
                  updateNodeInternals(nodeConfig.nodeId);
                }}
              />
            </AddConnectorButtonSection>
          )}
          <NodeVariablesEditableList
            variableConfigs={incomingVariables}
            isListSortable
            nodeId={nodeConfig.nodeId}
            isNodeReadOnly={false}
          />
          <NodeConfigPaneNodeFields
            nodeConfig={nodeConfig}
            isNodeConfigReadOnly={!isCurrentUserOwner}
          />
        </>
      );
      break;
  }

  return (
    <Container>
      {nodeConfig.type !== NodeType.ConditionNode && (
        <>
          <HeaderSection>
            <HeaderSectionHeader>Output variables</HeaderSectionHeader>
          </HeaderSection>
          <Section>
            {outputVariables.map((output) => (
              <SidePaneOutputRenderer key={output.id} outputItem={output} />
            ))}
          </Section>
        </>
      )}
      {content}
    </Container>
  );
}

const Container = styled.div`
  padding: 15px 15px 0 15px;
`;

const AddConnectorButtonSection = styled.div`
  margin-top: 10px;
  margin-bottom: 10px;
`;

export default NodeConfigPane;
