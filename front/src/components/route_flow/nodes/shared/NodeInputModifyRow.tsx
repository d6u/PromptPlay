import Input from "@mui/joy/Input";
import { useState } from "react";
import styled from "styled-components";
import RemoveButton from "./RemoveButton";

export const VARIABLE_ROW_MARGIN_BOTTOM = 5;

const Container = styled.div`
  display: flex;
  margin-top: ${VARIABLE_ROW_MARGIN_BOTTOM}px;

  &:last-child {
    // margin-bottom: 0;
  }
`;

const NameInput = styled(Input)`
  margin-right: 5px;
`;

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

export default function NodeInputModifyRow(props: Props) {
  const [name, setName] = useState(props.name);

  return (
    <Container>
      <NameInput
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
