import { Button } from "@mui/joy";
import { ReactNode, useMemo } from "react";
import { FlowState, useFlowStore } from "../../../state/flowState";
import { RawValue } from "./commonStyledComponents";

const selector = (state: FlowState) => ({
  nodeConfigs: state.nodeConfigs,
  setDetailPanelContentType: state.setDetailPanelContentType,
  detailPanelSelectedNodeId: state.detailPanelSelectedNodeId,
});

export default function PanelNodeOutput() {
  const { nodeConfigs, setDetailPanelContentType, detailPanelSelectedNodeId } =
    useFlowStore(selector);

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
        <div key={output.id}>
          <h4>{output.name}</h4>
          <RawValue key={output.id}>{content}</RawValue>
        </div>
      );
    }
  }

  return (
    <>
      {contents}
      <Button size="sm" onClick={() => setDetailPanelContentType(null)}>
        Close
      </Button>
    </>
  );
}
