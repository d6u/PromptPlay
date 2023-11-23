import { useMemo } from "react";
import { NodeOutputItem } from "../../../../../models/flow-content-types";
import { useFlowStore } from "../../../store/store-flow";
import { FlowState } from "../../../store/types-local-state";
import OutputRenderer from "../common/OutputRenderer";
import {
  HeaderSection,
  HeaderSectionHeader,
  PanelContentContainer,
  Section,
} from "../common/controls-common";

const selector = (state: FlowState) => ({
  nodeConfigs: state.nodeConfigs,
  detailPanelSelectedNodeId: state.detailPanelSelectedNodeId,
});

export default function PanelNodeConfig() {
  const { nodeConfigs, detailPanelSelectedNodeId } = useFlowStore(selector);

  const nodeConfig = useMemo(
    () =>
      detailPanelSelectedNodeId
        ? nodeConfigs[detailPanelSelectedNodeId] ?? null
        : null,
    [detailPanelSelectedNodeId, nodeConfigs]
  );

  return (
    <PanelContentContainer>
      <HeaderSection>
        <HeaderSectionHeader>Output variables</HeaderSectionHeader>
      </HeaderSection>
      <Section>
        {nodeConfig && "outputs" in nodeConfig
          ? nodeConfig.outputs.map((output) => (
              <OutputRenderer
                key={output.id}
                outputItem={output as NodeOutputItem}
              />
            ))
          : null}
      </Section>
    </PanelContentContainer>
  );
}
