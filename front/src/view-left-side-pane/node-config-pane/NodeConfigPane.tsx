import styled from '@emotion/styled';
import { ReactNode, useContext, useMemo } from 'react';
import invariant from 'tiny-invariant';

import {
  ConnectorType,
  NodeID,
  NodeType,
  getNodeDefinitionForNodeTypeName,
} from 'flow-models';

import HeaderSection from 'components/side-pane/SidePaneHeaderSection';
import HeaderSectionHeader from 'components/side-pane/SidePaneHeaderSectionHeader';
import SidePaneOutputRenderer from 'components/side-pane/SidePaneOutputRenderer';
import Section from 'components/side-pane/SidePaneSection';
import RouteFlowContext from 'state-flow/context/FlowRouteContext';
import { useFlowStore } from 'state-flow/context/FlowStoreContext';
import { selectVariables } from 'state-flow/util/state-utils';

import NodeVariablesEditableList from 'components/node-variables-editable-list/NodeVariablesEditableList';
import ConditionNodeConfigPanel from './ConditionNodeConfigPanel';
import NodeConfigPaneNodeFields from './NodeConfigPaneNodeFields';

function NodeConfigPane() {
  const { isCurrentUserOwner } = useContext(RouteFlowContext);

  const nodeConfigs = useFlowStore((s) => s.nodeConfigsDict);
  const variables = useFlowStore((s) => s.variablesDict);
  const selectedNodeId = useFlowStore((s) => s.canvasLeftPaneSelectedNodeId);

  const nodeConfig = useMemo(() => {
    return nodeConfigs[selectedNodeId as NodeID];
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

export default NodeConfigPane;
