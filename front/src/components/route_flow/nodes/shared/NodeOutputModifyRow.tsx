import Input from "@mui/joy/Input";
import { useState } from "react";
import styled from "styled-components";
import IconEdit from "../../../icons/IconEdit";
import { FlowState, useFlowStore } from "../../flowState";
import { DetailPanelContentType } from "../../flowTypes";
import RemoveButton from "./RemoveButton";

const VARIABLE_ROW_MARGIN_BOTTOM = 5;

const Container = styled.div`
  margin-top: ${VARIABLE_ROW_MARGIN_BOTTOM}px;
  display: flex;
  align-items: center;
  gap: 5px;

  &:last-child {
    // margin-bottom: 0;
  }
`;

const EditIcon = styled(IconEdit)`
  width: 25px;
  cursor: pointer;
`;

const selector = (state: FlowState) => ({
  setDetailPanelContentType: state.setDetailPanelContentType,
});

type Props =
  | {
      isReadOnly?: false;
      name: string;
      onConfirmNameChange: (name: string) => void;
      onRemove: () => void;
    }
  | {
      isReadOnly: true;
      name: string;
    };

export default function NodeOutputModifyRow(props: Props) {
  const { setDetailPanelContentType } = useFlowStore(selector);

  const [name, setName] = useState(props.name);

  return (
    <Container>
      <EditIcon
        onClick={() =>
          setDetailPanelContentType(DetailPanelContentType.FlowConfig)
        }
      />
      <Input
        color="primary"
        size="sm"
        variant="outlined"
        style={{ flexGrow: 1 }}
        disabled={props.isReadOnly ?? false}
        value={name}
        onChange={(e) => {
          setName(e.target.value);
        }}
        onKeyUp={(e) => {
          if (props.isReadOnly) {
            return;
          }
          if (e.key === "Enter") {
            props.onConfirmNameChange(name);
          }
        }}
        onBlur={() => {
          if (props.isReadOnly) {
            return;
          }
          props.onConfirmNameChange(name);
        }}
      />
      {!props.isReadOnly && <RemoveButton onClick={() => props.onRemove()} />}
    </Container>
  );
}
