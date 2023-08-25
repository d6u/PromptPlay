import { spaceV2SelectedBlockIdState } from "../../state/store";
import { SpaceContent } from "./interfaces";
import { isBlockGroupAnchor, isObject } from "./utils";
import Button from "@mui/joy/Button";
import Input from "@mui/joy/Input";
import { ReactNode } from "react";
import { useRecoilValue } from "recoil";
import styled from "styled-components";

const Container = styled.div`
  margin-bottom: 10px;
`;

const Header = styled.div`
  margin-bottom: 5px;
`;

const VariableMapRow = styled.div`
  display: flex;
  gap: 5px;
  margin-bottom: 5px;
`;

type Props = {
  content: SpaceContent;
  isOutput?: boolean;
  onAddVariableMapEntry: () => void;
};

export default function EditorVariableMap(props: Props) {
  const spaceV2SelectedBlockId = useRecoilValue(spaceV2SelectedBlockIdState);

  const block = spaceV2SelectedBlockId
    ? props.content.components[spaceV2SelectedBlockId]
    : null;

  if (block == null || isBlockGroupAnchor(block)) {
    return null;
  }

  const map = props.isOutput ? block.output : block.input;
  const rows: ReactNode[] = [];

  if (props.isOutput) {
    if (isObject(map)) {
      for (const [localName, scopeName] of Object.entries(map)) {
        rows.push(
          <VariableMapRow key={`${scopeName}-${localName}`}>
            <Input
              color="primary"
              size="sm"
              variant="soft"
              style={{ flexGrow: 1 }}
              value={localName}
            />
            <Input
              color="neutral"
              size="sm"
              variant="soft"
              style={{ flexGrow: 1 }}
              value={scopeName}
            />
            <Button color="danger" size="sm" variant="outlined">
              Remove
            </Button>
          </VariableMapRow>
        );
      }
    } else {
    }
  } else {
    if (isObject(map)) {
      for (const [scopeName, localName] of Object.entries(map)) {
        rows.push(
          <VariableMapRow key={`${scopeName}-${localName}`}>
            <Input
              color="neutral"
              size="sm"
              variant="soft"
              style={{ flexGrow: 1 }}
              value={scopeName}
            />
            <Input
              color="primary"
              size="sm"
              variant="soft"
              style={{ flexGrow: 1 }}
              value={localName}
            />
            <Button color="danger" size="sm" variant="outlined">
              Remove
            </Button>
          </VariableMapRow>
        );
      }
    } else {
    }
  }

  return (
    <Container>
      <Header>{props.isOutput ? "Output" : "Input"}</Header>
      <div>{rows}</div>
      <Button
        color="success"
        size="sm"
        variant="outlined"
        onClick={props.onAddVariableMapEntry}
      >
        Add
      </Button>
    </Container>
  );
}
