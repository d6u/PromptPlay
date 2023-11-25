import { useMemo } from "react";
import { VariableType } from "../../../../../models/v3-flow-content-types";
import { selectVariables } from "../../../state/state-utils";
import { useFlowStore } from "../../../state/store-flow-state";
import { FlowState } from "../../../state/store-flow-state-types";
import {
  HeaderSection,
  HeaderSectionHeader,
  PanelContentContainer,
  Section,
} from "../common/controls-common";
import OutputRenderer from "../common/OutputRenderer";

const selector = (state: FlowState) => ({
  variableMap: state.variableMap,
  detailPanelSelectedNodeId: state.detailPanelSelectedNodeId,
});

export default function PanelNodeConfig() {
  const { variableMap, detailPanelSelectedNodeId } = useFlowStore(selector);

  const outputVariables = useMemo(() => {
    return detailPanelSelectedNodeId == null
      ? []
      : selectVariables(
          detailPanelSelectedNodeId,
          VariableType.NodeOutput,
          variableMap,
        );
  }, [detailPanelSelectedNodeId, variableMap]);

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
