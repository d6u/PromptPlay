import styled from "@emotion/styled";
import Input from "@mui/joy/Input";
import { useState } from "react";
import InputReadonly from "../../flow-common/InputReadonly";
import RemoveButton from "./RemoveButton";

export const ROW_MARGIN_TOP = 5;

const Container = styled.div`
  display: flex;
  margin-top: ${ROW_MARGIN_TOP}px;

  &:first-of-type {
    margin-top: 0;
  }
`;

const NameInput = styled(Input)`
  margin-right: 5px;
  flex-grow: 1;
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
      {props.isReadOnly ? (
        <InputReadonly
          color="neutral"
          size="sm"
          variant="outlined"
          value={name}
        />
      ) : (
        <NameInput
          color="primary"
          size="sm"
          variant="outlined"
          value={name}
          onChange={(e) => {
            if (!props.isReadOnly) {
              setName(e.target.value);
            }
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
