import { ReactNode, useMemo } from "react";
import { useFlowStore } from "../store/flowStore";
import { FlowState } from "../store/storeTypes";
import {
  HeaderSection,
  HeaderSectionHeader,
  OutputValueItem,
  OutputValueName,
  PanelContentContainer,
  RawValue,
  Section,
} from "./controls-common";

const selector = (state: FlowState) => ({
  nodeConfigs: state.nodeConfigs,
  detailPanelSelectedNodeId: state.detailPanelSelectedNodeId,
  defaultVariableValueMap: state.getDefaultVariableValueMap(),
});

export default function PanelNodeConfig() {
  const { nodeConfigs, detailPanelSelectedNodeId, defaultVariableValueMap } =
    useFlowStore(selector);

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
              const value = defaultVariableValueMap[output.id];

              let content: ReactNode;
              if (typeof value === "string") {
                content = value;
              } else {
                content = JSON.stringify(value, null, 2);
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
