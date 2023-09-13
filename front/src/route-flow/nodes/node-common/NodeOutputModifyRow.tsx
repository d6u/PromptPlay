import styled from "@emotion/styled";
import Input from "@mui/joy/Input";
import { useState } from "react";
import InputDisabled from "./InputDisabled";
import RemoveButton from "./RemoveButton";

const Container = styled.div`
  margin-top: 5px;
  display: flex;
  align-items: center;
  gap: 5px;

  &:first-of-type {
    margin-top: 0;
  }
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
      {props.isReadOnly ? (
        <InputDisabled value={name} />
      ) : (
        <Input
          color="primary"
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
      )}
      {!props.isReadOnly && <RemoveButton onClick={() => props.onRemove()} />}
    </Container>
  );
}
