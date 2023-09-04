import Button from "@mui/joy/Button";
import Input from "@mui/joy/Input";
import { useState } from "react";
import styled from "styled-components";

const Container = styled.div`
  display: flex;
  margin-bottom: 10px;
`;

const NameInput = styled(Input)`
  margin-right: 5px;
`;

type Props = {
  name: string;
  onConfirmNameChange: (name: string) => void;
  onRemove: () => void;
};

export default function NodeInputVariableInput(props: Props) {
  const [name, setName] = useState(props.name);

  return (
    <Container>
      <NameInput
        color="primary"
        size="sm"
        variant="outlined"
        style={{ flexGrow: 1 }}
        // disabled={props.isReadOnly}
        value={name}
        onChange={(e) => {
          setName(e.target.value);
        }}
        onKeyUp={(e) => {
          if (e.key === "Enter") {
            props.onConfirmNameChange(name);
          }
        }}
        onBlur={() => props.onConfirmNameChange(name)}
      />
      <Button
        color="danger"
        size="sm"
        variant="outlined"
        onClick={() => props.onRemove()}
      >
        Remove
      </Button>
    </Container>
  );
}
