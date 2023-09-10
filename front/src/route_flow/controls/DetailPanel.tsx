import IconButton from "@mui/joy/IconButton";
import { ReactNode } from "react";
import styled from "styled-components";
import CrossIcon from "../../components/icons/CrossIcon";
import { FlowState, useFlowStore } from "../flowState";
import { DetailPanelContentType } from "../flowState";
import PanelFlowInputOutput from "./PanelFlowInputOutput";
import PanelNodeOutput from "./PanelNodeOutput";

const Container = styled.div<{ $hide: boolean }>`
  position: relative;
  height: 100%;
  width: 50vw;
  max-width: 600px;
  background-color: #fff;
  border-left: 1px solid #ddd;
  display: ${(props) => (props.$hide ? "none" : "initial")};
`;

const StyledCloseButtonWrapper = styled.div`
  position: absolute;
  top: 5px;
  left: -45px;
`;

const StyledIconCross = styled(CrossIcon)`
  width: 16px;
`;

const Content = styled.div`
  height: 100%;
  overflow-y: auto;
`;

const selector = (state: FlowState) => ({
  detailPanelContentType: state.detailPanelContentType,
  setDetailPanelContentType: state.setDetailPanelContentType,
});

type Props = {
  onRun: () => void;
};

export default function DetailPanel(props: Props) {
  const { detailPanelContentType, setDetailPanelContentType } =
    useFlowStore(selector);

  let content: ReactNode;
  switch (detailPanelContentType) {
    case DetailPanelContentType.NodeOutput: {
      content = <PanelNodeOutput />;
      break;
    }
    case DetailPanelContentType.FlowConfig: {
      content = <PanelFlowInputOutput onRun={props.onRun} />;
      break;
    }
  }

  return (
    <Container $hide={!detailPanelContentType}>
      <StyledCloseButtonWrapper>
        <IconButton onClick={() => setDetailPanelContentType(null)}>
          <StyledIconCross />
        </IconButton>
      </StyledCloseButtonWrapper>
      <Content>{content}</Content>
    </Container>
  );
}
