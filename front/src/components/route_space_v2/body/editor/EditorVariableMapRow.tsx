import Button from "@mui/joy/Button";
import Input from "@mui/joy/Input";
import { useState } from "react";
import styled from "styled-components";

const Container = styled.div`
  display: flex;
  gap: 5px;
  margin-bottom: 5px;
`;

type Props = {
  scopeName: string;
  localName: string;
  isInput: boolean;
  onSaveScopeName: (value: string) => void;
  onSaveLocalName: (value: string) => void;
  onRemove: () => void;
};

export default function EditorVariableMapRow(props: Props) {
  const [localName, setLocalName] = useState(props.localName);
  const [scopeName, setScopeName] = useState(props.scopeName);

  if (props.isInput) {
    return (
      <Container>
        <Input
          color="primary"
          size="sm"
          variant="outlined"
          style={{ flexGrow: 1 }}
          value={scopeName}
          onChange={(e) => {
            setScopeName(e.target.value);
          }}
          onKeyUp={(e) => {
            if (e.key === "Enter") {
              props.onSaveScopeName(scopeName);
            }
          }}
          onBlur={() => props.onSaveScopeName(scopeName)}
        />
        <Input
          color="primary"
          size="sm"
          variant="solid"
          style={{ flexGrow: 1 }}
          value={localName}
          onChange={(e) => {
            setLocalName(e.target.value);
          }}
          onKeyUp={(e) => {
            if (e.key === "Enter") {
              props.onSaveLocalName(localName);
            }
          }}
          onBlur={() => props.onSaveLocalName(localName)}
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
  } else {
    return (
      <Container>
        <Input
          color="primary"
          size="sm"
          variant="solid"
          style={{ flexGrow: 1 }}
          value={localName}
          onChange={(e) => {
            setLocalName(e.target.value);
          }}
          onKeyUp={(e) => {
            if (e.key === "Enter") {
              props.onSaveLocalName(localName);
            }
          }}
          onBlur={() => props.onSaveLocalName(localName)}
        />
        <Input
          color="primary"
          size="sm"
          variant="outlined"
          style={{ flexGrow: 1 }}
          value={scopeName}
          onChange={(e) => {
            setScopeName(e.target.value);
          }}
          onKeyUp={(e) => {
            if (e.key === "Enter") {
              props.onSaveScopeName(scopeName);
            }
          }}
          onBlur={() => props.onSaveScopeName(scopeName)}
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
}
