import styled from '@emotion/styled';
import { useContext, useMemo } from 'react';
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

import NodeBoxVariablesEditableList from 'components/node-variables-editable-list/NodeBoxVariablesEditableList';
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
              helperMessage: incomingVariableConfig?.helperMessage,
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

  return (
    <Container>
      <HeaderSection>
        <HeaderSectionHeader>Output variables</HeaderSectionHeader>
      </HeaderSection>
      <Section>
        {outputVariables.map((output) => (
          <SidePaneOutputRenderer key={output.id} outputItem={output} />
        ))}
      </Section>
      {![
        NodeType.InputNode,
        NodeType.OutputNode,
        NodeType.ConditionNode,
        NodeType.JavaScriptFunctionNode,
      ].includes(nodeConfig.type) && (
        <>
          <HeaderSection>
            <HeaderSectionHeader>
              {nodeDefinition.label} Config
            </HeaderSectionHeader>
          </HeaderSection>
          <NodeBoxVariablesEditableList
            variables={incomingVariables}
            isSortable
          />
          <NodeConfigPaneNodeFields
            nodeConfig={nodeConfig}
            isNodeConfigReadOnly={!isCurrentUserOwner}
          />
        </>
      )}
    </Container>
  );
}

const Container = styled.div`
  padding: 15px 15px 0 15px;
`;

export default NodeConfigPane;
