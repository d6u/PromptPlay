import styled from '@emotion/styled';
import { useContext, useMemo } from 'react';
import invariant from 'tiny-invariant';

import { ConnectorType, NodeID, NodeType } from 'flow-models';

import { useFlowStore } from 'state-flow/context/FlowStoreContext';
import { selectVariables } from 'state-flow/util/state-utils';

import HeaderSection from 'components/side-pane/SidePaneHeaderSection';
import HeaderSectionHeader from 'components/side-pane/SidePaneHeaderSectionHeader';
import Section from 'components/side-pane/SidePaneSection';

import RouteFlowContext from 'state-flow/context/FlowRouteContext';
import OutputRenderer from '../../view-right-side-pane/common/OutputRenderer';
import NodeConfigPaneNodeFields from './NodeConfigPaneNodeFields';

function NodeConfigPane() {
  const { isCurrentUserOwner } = useContext(RouteFlowContext);

  const nodeConfigs = useFlowStore((s) => s.nodeConfigsDict);
  const variables = useFlowStore((s) => s.variablesDict);
  const selectedNodeId = useFlowStore((s) => s.detailPanelSelectedNodeId);

  const outputVariables = useMemo(() => {
    return selectedNodeId == null
      ? []
      : selectVariables(selectedNodeId, ConnectorType.NodeOutput, variables);
  }, [variables, selectedNodeId]);

  const nodeConfig = useMemo(() => {
    return nodeConfigs[selectedNodeId as NodeID];
  }, [nodeConfigs, selectedNodeId]);

  invariant(nodeConfig != null, 'nodeConfig is not null');

  return (
    <Container>
      <HeaderSection>
        <HeaderSectionHeader>Output variables</HeaderSectionHeader>
      </HeaderSection>
      <Section>
        {outputVariables.map((output) => (
          <OutputRenderer key={output.id} outputItem={output} />
        ))}
      </Section>
      {![
        NodeType.InputNode,
        NodeType.OutputNode,
        NodeType.ConditionNode,
        NodeType.JavaScriptFunctionNode,
      ].includes(nodeConfig.type) && (
        <NodeConfigPaneNodeFields
          nodeConfig={nodeConfig}
          isNodeConfigReadOnly={!isCurrentUserOwner}
        />
      )}
    </Container>
  );
}

const Container = styled.div`
  padding: 20px 20px 0 20px;
  width: 400px;
`;

export default NodeConfigPane;
