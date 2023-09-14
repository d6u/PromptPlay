import styled from "@emotion/styled";
import IconButton from "@mui/joy/IconButton";
import { ReactNode } from "react";
import CrossIcon from "../../component-icons/CrossIcon";
import { DetailPanelContentType, FlowState, useFlowStore } from "../flowState";
import PanelChatGPTMessageConfig from "./PanelChatGPTMessageConfig";
import PanelFlowInputOutput from "./PanelFlowInputOutput";
import PanelNodeConfig from "./PanelNodeConfig";

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
  runFlow: state.runFlow,
});

export default function SidePanel() {
  const { detailPanelContentType, setDetailPanelContentType, runFlow } =
    useFlowStore(selector);

  let content: ReactNode;
  switch (detailPanelContentType) {
    case DetailPanelContentType.NodeConfig: {
      content = <PanelNodeConfig />;
      break;
    }
    case DetailPanelContentType.FlowConfig: {
      content = <PanelFlowInputOutput onRun={runFlow} />;
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
        <IconButton onClick={() => setDetailPanelContentType(null)}>
          <StyledIconCross />
        </IconButton>
      </StyledCloseButtonWrapper>
      <Content>{content}</Content>
    </Container>
  );
}
