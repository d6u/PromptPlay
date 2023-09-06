import Button from "@mui/joy/Button";
import { Panel } from "reactflow";
import styled from "styled-components";
import { NodeType } from "../../static/flowTypes";

const Content = styled.div`
  display: flex;
  gap: 10px;
`;

type Props = {
  onRun: () => void;
  onAddNode: (type: NodeType) => void;
};

export default function CanvasPanel(props: Props) {
  return (
    <Panel position="top-center">
      <Content>
        <Button size="sm" onClick={() => props.onRun()}>
          Run
        </Button>
        <Button
          size="sm"
          onClick={() => props.onAddNode(NodeType.JavaScriptFunctionNode)}
        >
          Add base node
        </Button>
        <Button
          size="sm"
          onClick={() => props.onAddNode(NodeType.ChatGPTMessageNode)}
        >
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
