import { ReactNode, useMemo } from "react";
import { FlowState, useFlowStore } from "../flowState";
import {
  OutputValueItem,
  OutputValueName,
  PanelContentContainer,
  RawValue,
} from "./commonStyledComponents";

const selector = (state: FlowState) => ({
  nodeConfigs: state.nodeConfigs,
  detailPanelSelectedNodeId: state.detailPanelSelectedNodeId,
});

export default function PanelNodeOutput() {
  const { nodeConfigs, detailPanelSelectedNodeId } = useFlowStore(selector);

  const nodeConfig = useMemo(
    () =>
      detailPanelSelectedNodeId ? nodeConfigs[detailPanelSelectedNodeId] : null,
    [detailPanelSelectedNodeId, nodeConfigs]
  );

  const contents: ReactNode[] = [];
  if (nodeConfig && "outputs" in nodeConfig) {
    for (const output of nodeConfig.outputs ?? []) {
      let content: ReactNode;
      if (typeof output?.value === "string") {
        content = output?.value;
      } else {
        content = JSON.stringify(output?.value, null, 2);
      }
      contents.push(
        <OutputValueItem key={output.id}>
          <OutputValueName>{output.name}</OutputValueName>
          <RawValue key={output.id}>{content}</RawValue>
        </OutputValueItem>
      );
    }
  }

  return <PanelContentContainer>{contents}</PanelContentContainer>;
}
