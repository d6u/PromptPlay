import Button from "@mui/joy/Button";
import { Panel } from "reactflow";
import styled from "styled-components";
import { NodeType } from "./nodeTypes";

const Content = styled.div`
  display: flex;
  gap: 10px;
`;

type Props = {
  onAddNode: (type: NodeType) => void;
};

export default function CanvasPanel(props: Props) {
  return (
    <Panel position="top-center">
      <Content>
        <Button
          size="sm"
          onClick={() => props.onAddNode(NodeType.JavaScriptFunctionNode)}
        >
          Add base node
        </Button>
        <Button size="sm" onClick={() => {}}>
          Add ChatGPT Message
        </Button>
        <Button size="sm" onClick={() => {}}>
          Add OpenAI API
        </Button>
        <Button size="sm" onClick={() => {}}>
          Reset space
        </Button>
      </Content>
    </Panel>
  );
}
