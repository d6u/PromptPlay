import { Button } from "@mui/joy";
import { find, propEq } from "ramda";
import { ReactNode, useMemo } from "react";
import { Node } from "reactflow";
import { FlowState, useFlowStore } from "../../../state/flowState";
import { NodeData } from "../../../static/flowTypes";
import { RawValue } from "../common/commonStyledComponents";

const selector = (state: FlowState) => ({
  nodes: state.nodes,
  setDetailPanelContentType: state.setDetailPanelContentType,
  detailPanelSelectedNodeId: state.detailPanelSelectedNodeId,
});

export default function PanelNodeOutput() {
  const { nodes, setDetailPanelContentType, detailPanelSelectedNodeId } =
    useFlowStore(selector);

  const node = useMemo(
    () =>
      find<Node<NodeData>>(propEq(detailPanelSelectedNodeId, "id"))(nodes) ??
      null,
    [detailPanelSelectedNodeId, nodes]
  );

  const contents: ReactNode[] = [];
  if (node && "outputs" in node.data) {
    for (const output of node.data.outputs ?? []) {
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
