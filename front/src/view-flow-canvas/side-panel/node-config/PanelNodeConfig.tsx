import { ConnectorType } from 'flow-models';
import { useMemo } from 'react';
import { useStoreFromFlowStoreContext } from 'state-flow/context/FlowStoreContext';
import { selectVariables } from 'state-flow/state-utils';
import { useStore } from 'zustand';
import OutputRenderer from '../common/OutputRenderer';
import {
  HeaderSection,
  HeaderSectionHeader,
  PanelContentContainer,
  Section,
} from '../common/controls-common';

export default function PanelNodeConfig() {
  const flowStore = useStoreFromFlowStoreContext();

  const variablesDict = useStore(flowStore, (s) => s.variablesDict);
  const detailPanelSelectedNodeId = useStore(
    flowStore,
    (s) => s.detailPanelSelectedNodeId,
  );

  const outputVariables = useMemo(() => {
    return detailPanelSelectedNodeId == null
      ? []
      : selectVariables(
          detailPanelSelectedNodeId,
          ConnectorType.NodeOutput,
          variablesDict,
        );
  }, [detailPanelSelectedNodeId, variablesDict]);

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
