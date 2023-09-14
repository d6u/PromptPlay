import styled from "@emotion/styled";
import IconButton from "@mui/joy/IconButton";
import { ReactNode } from "react";
import CrossIcon from "../../component-icons/CrossIcon";
import { DetailPanelContentType, FlowState, useFlowStore } from "../flowState";
import PanelChatGPTMessageConfig from "./PanelChatGPTMessageConfig";
import PanelEvaluationMode from "./PanelEvaluationMode";
import PanelNodeConfig from "./PanelNodeConfig";

const Container = styled.div<{ $hide: boolean }>`
  position: relative;
  height: 100%;
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

export default function SidePanel() {
  const { detailPanelContentType, setDetailPanelContentType } =
    useFlowStore(selector);

  let content: ReactNode;
  switch (detailPanelContentType) {
    case DetailPanelContentType.NodeConfig: {
      content = <PanelNodeConfig />;
      break;
    }
    case DetailPanelContentType.EvaluationMode: {
      content = <PanelEvaluationMode />;
      break;
    }
    case DetailPanelContentType.ChatGPTMessageConfig: {
      content = <PanelChatGPTMessageConfig />;
      break;
    }
  }

  return (
    <Container $hide={!detailPanelContentType}>
      <StyledCloseButtonWrapper>
        <IconButton size="md" onClick={() => setDetailPanelContentType(null)}>
          <StyledIconCross />
        </IconButton>
      </StyledCloseButtonWrapper>
      <Content>{content}</Content>
    </Container>
  );
}
