import Button from "@mui/joy/Button";
import Input from "@mui/joy/Input";
import { useState } from "react";
import styled from "styled-components";
import IconEdit from "../../icons/IconEdit";

const VARIABLE_ROW_MARGIN_BOTTOM = 5;

const Container = styled.div`
  margin-bottom: ${VARIABLE_ROW_MARGIN_BOTTOM}px;
  display: flex;
  align-items: center;
  gap: 5px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const EditIcon = styled(IconEdit)`
  width: 25px;
  cursor: pointer;
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

export default function NodeOutputModifyRow(props: Props) {
  const [name, setName] = useState(props.name);

  return (
    <Container>
      <EditIcon />
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
      {!props.isReadOnly && (
        <Button
          color="danger"
          size="sm"
          variant="outlined"
          onClick={() => props.onRemove()}
        >
          Remove
        </Button>
      )}
    </Container>
  );
}
