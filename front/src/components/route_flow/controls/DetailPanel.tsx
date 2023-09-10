import { ReactNode } from "react";
import styled from "styled-components";
import { FlowState, useFlowStore } from "../flowState";
import { DetailPanelContentType } from "../flowState";
import PanelFlowInputOutput from "./PanelFlowInputOutput";
import PanelNodeOutput from "./PanelNodeOutput";

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

const selector = (state: FlowState) => ({
  detailPanelContentType: state.detailPanelContentType,
});

export default function DetailPanel() {
  const { detailPanelContentType } = useFlowStore(selector);

  let content: ReactNode;
  switch (detailPanelContentType) {
    case DetailPanelContentType.NodeOutput: {
      content = <PanelNodeOutput />;
      break;
    }
    case DetailPanelContentType.FlowConfig: {
      content = <PanelFlowInputOutput />;
      break;
    }
  }

  return <Container $hide={!detailPanelContentType}>{content}</Container>;
}
