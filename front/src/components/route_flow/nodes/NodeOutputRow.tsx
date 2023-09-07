import { useNodeId } from "reactflow";
import styled from "styled-components";
import { RFState, useRFStore } from "../../../state/flowState";
import IconInspect from "../../icons/IconInspect";
import { VARIABLE_LABEL_HEIGHT } from "../common/commonStyledComponents";
import { VARIABLE_ROW_MARGIN_BOTTOM } from "./NodeInputModifyRow";

const Container = styled.div`
  margin-bottom: ${VARIABLE_ROW_MARGIN_BOTTOM}px;
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
`;

const Name = styled.code`
  white-space: nowrap;
`;

const Value = styled.code`
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
`;

const InspectIcon = styled(IconInspect)`
  width: 25px;
  height: 25px;
  flex-shrink: 0;
  cursor: pointer;
`;

const selector = (state: RFState) => ({
  onSelectOutputToInspect: state.onSelectOutputToInspect,
});

type Props = {
  id: string;
  name: string;
  value: string;
};

export default function NodeOutputRow(props: Props) {
  const { onSelectOutputToInspect } = useRFStore(selector);

  const nodeId = useNodeId()!;

  return (
    <Container>
      <Content>
        <Name>{props.name} =&nbsp;</Name>
        <Value>{JSON.stringify(props.value)}</Value>
      </Content>
      <InspectIcon
        onClick={() => {
          onSelectOutputToInspect(nodeId, props.id);
        }}
      />
    </Container>
  );
}
