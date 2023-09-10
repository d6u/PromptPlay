import styled from "@emotion/styled";
import { useNodeId } from "reactflow";
import {
  DetailPanelContentType,
  FlowState,
  useFlowStore,
} from "../../flowState";
import { ROW_MARGIN_TOP } from "./NodeInputModifyRow";

export const VARIABLE_LABEL_HEIGHT = 32;

const Container = styled.div`
  margin-bottom: ${ROW_MARGIN_TOP}px;
  display: flex;
  gap: 5px;
  align-items: center;

  &:last-child {
    margin-bottom: 0;
  }
`;

const Content = styled.div`
  height: ${VARIABLE_LABEL_HEIGHT}px;
  padding: 0 10px;
  border: 1px solid blue;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-radius: 5px;
  min-width: 0;
  flex-grow: 1;
  cursor: pointer;
  font-size: 14px;
`;

const Name = styled.code`
  white-space: nowrap;
`;

const Value = styled.code`
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
`;

const selector = (state: FlowState) => ({
  setDetailPanelContentType: state.setDetailPanelContentType,
  setDetailPanelSelectedNodeId: state.setDetailPanelSelectedNodeId,
});

type Props = {
  id: string;
  name: string;
  value: string;
  onClick?: () => void;
};

export default function NodeOutputRow(props: Props) {
  const { setDetailPanelContentType, setDetailPanelSelectedNodeId } =
    useFlowStore(selector);

  const nodeId = useNodeId()!;

  return (
    <Container>
      <Content
        onClick={
          props.onClick ??
          (() => {
            setDetailPanelContentType(DetailPanelContentType.NodeConfig);
            setDetailPanelSelectedNodeId(nodeId);
          })
        }
      >
        <Name>{props.name} =&nbsp;</Name>
        <Value>{JSON.stringify(props.value)}</Value>
      </Content>
    </Container>
  );
}
