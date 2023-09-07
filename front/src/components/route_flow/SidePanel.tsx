import { Button } from "@mui/joy";
import { find, path, propEq } from "ramda";
import { ReactNode, useMemo } from "react";
import styled from "styled-components";
import { RFState, useRFStore } from "../../state/flowState";
import { NodeOutputItem } from "../../static/flowTypes";

const Container = styled.div<{ $hide: boolean }>`
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: 50vw;
  max-width: 600px;
  background-color: #fff;
  border-left: 1px solid #ddd;
  padding: 20px;
  visibility: ${(props) => (props.$hide ? "hidden" : "visible")};
`;

const RawValue = styled.pre`
  margin: 0;
  border: 1px solid #ddd;
  padding: 10px;
  border-radius: 5px;
  white-space: pre-wrap;
`;

const selector = (state: RFState) => ({
  nodes: state.nodes,
  inspectorSelectedNodeId: state.inspectorSelectedNodeId,
  inspectorSelectedOutputId: state.inspectorSelectedOutputId,
  onSelectOutputToInspect: state.onSelectOutputToInspect,
});

export default function SidePanel() {
  const {
    nodes,
    inspectorSelectedNodeId,
    inspectorSelectedOutputId,
    onSelectOutputToInspect,
  } = useRFStore(selector);

  const output = useMemo(() => {
    const node = find(propEq(inspectorSelectedNodeId, "id"))(nodes);
    if (!node) {
      return null;
    }
    const outputs = path(["data", "outputs"])(node) as NodeOutputItem[];
    return (
      find<NodeOutputItem>(propEq(inspectorSelectedOutputId, "id"))(outputs) ??
      null
    );
  }, [inspectorSelectedNodeId, inspectorSelectedOutputId, nodes]);

  let content: ReactNode;
  if (typeof output?.value === "string") {
    content = output?.value;
  } else {
    content = JSON.stringify(output?.value, null, 2);
  }

  return (
    <Container
      $hide={
        inspectorSelectedNodeId == null || inspectorSelectedOutputId == null
      }
    >
      <RawValue>{content}</RawValue>
      <Button size="sm" onClick={() => onSelectOutputToInspect(null, null)}>
        Close
      </Button>
    </Container>
  );
}
