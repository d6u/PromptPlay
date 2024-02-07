import { useMemo } from 'react';

import { ConnectorType } from 'flow-models';

import { useFlowStore } from 'state-flow/context/FlowStoreContext';
import { selectVariables } from 'state-flow/util/state-utils';

import OutputRenderer from '../common/OutputRenderer';
import {
  HeaderSection,
  HeaderSectionHeader,
  PanelContentContainer,
  Section,
} from '../common/controls-common';

function NodeConfigPane() {
  const variables = useFlowStore((s) => s.variablesDict);
  const selectedNodeId = useFlowStore((s) => s.detailPanelSelectedNodeId);

  const outputVariables = useMemo(() => {
    return selectedNodeId == null
      ? []
      : selectVariables(selectedNodeId, ConnectorType.NodeOutput, variables);
  }, [variables, selectedNodeId]);

  return (
    <PanelContentContainer>
      <HeaderSection>
        <HeaderSectionHeader>Output variables</HeaderSectionHeader>
      </HeaderSection>
      <Section>
        {outputVariables.map((output) => (
          <OutputRenderer key={output.id} outputItem={output} />
        ))}
      </Section>
    </PanelContentContainer>
  );
}

export default NodeConfigPane;
