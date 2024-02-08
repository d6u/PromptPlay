import styled from '@emotion/styled';
import { useMemo } from 'react';

import { ConnectorType } from 'flow-models';

import { useFlowStore } from 'state-flow/context/FlowStoreContext';
import { selectVariables } from 'state-flow/util/state-utils';

import HeaderSection from 'components/side-pane/SidePaneHeaderSection';
import HeaderSectionHeader from 'components/side-pane/SidePaneHeaderSectionHeader';
import Section from 'components/side-pane/SidePaneSection';

import OutputRenderer from '../../view-right-side-pane/common/OutputRenderer';

function NodeConfigPane() {
  const variables = useFlowStore((s) => s.variablesDict);
  const selectedNodeId = useFlowStore((s) => s.detailPanelSelectedNodeId);

  const outputVariables = useMemo(() => {
    return selectedNodeId == null
      ? []
      : selectVariables(selectedNodeId, ConnectorType.NodeOutput, variables);
  }, [variables, selectedNodeId]);

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
    </Container>
  );
}

const Container = styled.div`
  padding: 20px 20px 0 20px;
  width: 400px;
`;

export default NodeConfigPane;
