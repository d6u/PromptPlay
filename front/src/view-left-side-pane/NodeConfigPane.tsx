import styled from '@emotion/styled';
import { ReactNode, useContext, useMemo } from 'react';
import invariant from 'tiny-invariant';

import { ConnectorType, NodeType } from 'flow-models';

import HeaderSection from 'components/side-pane/SidePaneHeaderSection';
import HeaderSectionHeader from 'components/side-pane/SidePaneHeaderSectionHeader';
import SidePaneOutputRenderer from 'components/side-pane/SidePaneOutputRenderer';
import Section from 'components/side-pane/SidePaneSection';
import RouteFlowContext from 'state-flow/context/FlowRouteContext';
import { useFlowStore } from 'state-flow/flow-store';
import { selectVariables } from 'state-flow/util/state-utils';

import ConditionNodeConfigPanel from './node-config-panes/ConditionNodeConfigPane';
import DefaultNodeConfigPane from './node-config-panes/DefaultNodeConfigPane';
import InputNodeConfigPane from './node-config-panes/InputNodeConfigPane';
import OutputNodeConfigPane from './node-config-panes/OutputNodeConfigPane';

function NodeConfigPane() {
  const { isCurrentUserOwner } = useContext(RouteFlowContext);
  const isReadOnly = !isCurrentUserOwner;

  const nodeId = useFlowStore((s) => s.canvasLeftPaneSelectedNodeId);

  invariant(nodeId != null, 'nodeId is not null');

  const nodeConfigs = useFlowStore((s) => s.getFlowContent().nodeConfigsDict);
  const variables = useFlowStore((s) => s.getFlowContent().variablesDict);

  const nodeConfig = useMemo(() => nodeConfigs[nodeId], [nodeConfigs, nodeId]);

  const inputVariables = useMemo(() => {
    return selectVariables(nodeId, ConnectorType.NodeInput, variables);
  }, [variables, nodeId]);

  const outputVariables = useMemo(() => {
    return selectVariables(nodeId, ConnectorType.NodeOutput, variables);
  }, [variables, nodeId]);

  switch (nodeConfig.type) {
    case NodeType.InputNode:
      return (
        <InputNodeConfigPane
          nodeId={nodeId}
          isReadOnly={isReadOnly}
          nodeConfig={nodeConfig}
        />
      );
    case NodeType.OutputNode:
      return (
        <OutputNodeConfigPane
          nodeId={nodeId}
          isReadOnly={isReadOnly}
          nodeConfig={nodeConfig}
        />
      );
    case NodeType.ConditionNode:
      return (
        <ConditionNodeConfigPanel
          nodeId={nodeConfig.nodeId}
          isReadOnly={isReadOnly}
          nodeConfig={nodeConfig}
        />
      );
    case NodeType.JavaScriptFunctionNode:
      let content: ReactNode;

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
          {content}
        </Container>
      );

    default:
      return (
        <DefaultNodeConfigPane
          nodeId={nodeConfig.nodeId}
          isReadOnly={isReadOnly}
          nodeConfig={nodeConfig}
          inputVariables={inputVariables}
          outputVariables={outputVariables}
        />
      );
  }
}

const Container = styled.div`
  padding: 15px 15px 0 15px;
`;

export default NodeConfigPane;
