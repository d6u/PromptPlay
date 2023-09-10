import { ReactNode, useMemo } from "react";
import { FlowState, useFlowStore } from "../flowState";
import {
  HeaderSection,
  HeaderSectionHeader,
  OutputValueItem,
  OutputValueName,
  PanelContentContainer,
  RawValue,
  Section,
} from "./commonStyledComponents";

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
          ? nodeConfig.outputs.map((output) => {
              let content: ReactNode;

              if (typeof output?.value === "string") {
                content = output?.value;
              } else {
                content = JSON.stringify(output?.value, null, 2);
              }

              return (
                <OutputValueItem key={output.id}>
                  <OutputValueName>{output.name}</OutputValueName>
                  <RawValue key={output.id}>{content}</RawValue>
                </OutputValueItem>
              );
            })
          : null}
      </Section>
    </PanelContentContainer>
  );
}
