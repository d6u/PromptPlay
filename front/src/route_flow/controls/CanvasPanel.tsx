import Button from "@mui/joy/Button";
import Dropdown from "@mui/joy/Dropdown";
import Menu from "@mui/joy/Menu";
import MenuButton from "@mui/joy/MenuButton";
import MenuItem from "@mui/joy/MenuItem";
import { useEffect, useState } from "react";
import { Panel } from "reactflow";
import styled from "styled-components";
import { NodeType } from "../flowTypes";

const Content = styled.div`
  display: flex;
  gap: 10px;
`;

type Props = {
  onRun: () => void;
  onAddNode: (type: NodeType) => void;
};

export default function CanvasPanel(props: Props) {
  const [useNarrowLayout, setUseNarrowLayout] = useState(
    window.innerWidth < 900
  );

  useEffect(() => {
    function handleResize() {
      if (window.innerWidth < 900) {
        setUseNarrowLayout(true);
      } else {
        setUseNarrowLayout(false);
      }
    }
    window.addEventListener("resize", handleResize, { passive: true });
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <Panel position="top-left">
      {useNarrowLayout ? (
        <Content>
          <Dropdown>
            <MenuButton variant="solid" size="sm" color="primary">
              Add
            </MenuButton>
            <Menu size="sm">
              <MenuItem
                color="primary"
                onClick={() => props.onAddNode(NodeType.InputNode)}
              >
                Add Input
              </MenuItem>
              <MenuItem
                color="primary"
                onClick={() => props.onAddNode(NodeType.ChatGPTMessageNode)}
              >
                Add ChatGPT Message
              </MenuItem>
              <MenuItem
                color="primary"
                onClick={() =>
                  props.onAddNode(NodeType.ChatGPTChatCompletionNode)
                }
              >
                Add ChatGPT Chat Completion
              </MenuItem>
              <MenuItem
                color="primary"
                onClick={() => props.onAddNode(NodeType.JavaScriptFunctionNode)}
              >
                Add JavaScript
              </MenuItem>
              <MenuItem
                color="primary"
                onClick={() => props.onAddNode(NodeType.OutputNode)}
              >
                Add Output
              </MenuItem>
            </Menu>
          </Dropdown>
          <Button
            size="sm"
            color="success"
            variant="solid"
            onClick={() => props.onRun()}
          >
            Run
          </Button>
        </Content>
      ) : (
        <Content>
          <Button
            size="sm"
            color="primary"
            variant="solid"
            onClick={() => props.onAddNode(NodeType.InputNode)}
          >
            Add Input
          </Button>
          <Button
            size="sm"
            color="primary"
            variant="solid"
            onClick={() => props.onAddNode(NodeType.ChatGPTMessageNode)}
          >
            Add ChatGPT Message
          </Button>
          <Button
            size="sm"
            color="primary"
            variant="solid"
            onClick={() => props.onAddNode(NodeType.ChatGPTChatCompletionNode)}
          >
            Add ChatGPT Chat Completion
          </Button>
          <Button
            size="sm"
            color="primary"
            variant="solid"
            onClick={() => props.onAddNode(NodeType.JavaScriptFunctionNode)}
          >
            Add JavaScript
          </Button>
          <Button
            size="sm"
            color="primary"
            variant="solid"
            onClick={() => props.onAddNode(NodeType.OutputNode)}
          >
            Add Output
          </Button>
          <Button
            size="sm"
            color="success"
            variant="solid"
            onClick={() => props.onRun()}
          >
            Run
          </Button>
        </Content>
      )}
    </Panel>
  );
}
