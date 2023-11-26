import { useContext, useMemo } from "react";
import invariant from "ts-invariant";
import { useStore } from "zustand";
import { VariableType } from "../../../../../models/v3-flow-content-types";
import FlowContext from "../../../FlowContext";
import { selectVariables } from "../../../store/state-utils";
import {
  HeaderSection,
  HeaderSectionHeader,
  PanelContentContainer,
  Section,
} from "../common/controls-common";
import OutputRenderer from "../common/OutputRenderer";

export default function PanelNodeConfig() {
  const { flowStore } = useContext(FlowContext);
  invariant(flowStore != null, "Must provide flowStore");

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
          VariableType.NodeOutput,
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
