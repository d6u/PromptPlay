import styled from "@emotion/styled";
import {
  Button,
  Dropdown,
  FormControl,
  FormLabel,
  Menu,
  MenuButton,
  MenuItem,
  ToggleButtonGroup,
} from "@mui/joy";
import { useCallback, useEffect, useState } from "react";
import { useStoreApi } from "reactflow";
import { NodeType } from "../flowTypes";
import { NODE_BOX_WIDTH } from "../nodes/node-common/NodeBox";
import { useFlowStore } from "../storeFlow";
import { DetailPanelContentType, FlowState } from "../storeTypes";

const USE_NARROW_LAYOUT_BREAKPOINT = 1050;

const Container = styled.div`
  height: 51px;
  border-bottom: 1px solid #ececf1;
  padding: 0 20px;
  flex-shrink: 0;
  display: grid;
  grid-template-columns: auto auto;
`;

const LeftAligned = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
`;

const RightAligned = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 5px;
`;

const selector = (state: FlowState) => ({
  isCurrentUserOwner: state.isCurrentUserOwner,
  detailPanelContentType: state.detailPanelContentType,
  setDetailPanelContentType: state.setDetailPanelContentType,
  addNode: state.addNode,
  runFlow: state.runFlow,
});

export default function ToolBar() {
  const storeApi = useStoreApi();

  const {
    isCurrentUserOwner,
    detailPanelContentType,
    setDetailPanelContentType,
    addNode,
    runFlow,
  } = useFlowStore(selector);

  const addNodeWithType = useCallback(
    (type: NodeType) => {
      if (!isCurrentUserOwner) return;

      const {
        width,
        transform: [transformX, transformY, zoomLevel],
      } = storeApi.getState();

      const zoomMultiplier = 1 / zoomLevel;

      // Figure out the center of the current viewport
      const centerX =
        -transformX * zoomMultiplier + (width * zoomMultiplier) / 2;

      // Put the node at the 200px below the viewport top
      const centerY = -transformY * zoomMultiplier + 200 * zoomMultiplier;

      addNode(type, centerX - NODE_BOX_WIDTH / 2, centerY);
    },
    [addNode, isCurrentUserOwner, storeApi]
  );

  const [useNarrowLayout, setUseNarrowLayout] = useState(
    window.innerWidth < USE_NARROW_LAYOUT_BREAKPOINT
  );

  useEffect(() => {
    function handleResize() {
      if (window.innerWidth < USE_NARROW_LAYOUT_BREAKPOINT) {
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
    <Container>
      <LeftAligned>
        {useNarrowLayout ? (
          <>
            <Dropdown>
              <MenuButton color="primary">Add</MenuButton>
              <Menu>
                <MenuItem
                  color="primary"
                  onClick={() => addNodeWithType(NodeType.InputNode)}
                >
                  Add Input
                </MenuItem>
                <MenuItem
                  color="primary"
                  onClick={() => addNodeWithType(NodeType.ChatGPTMessageNode)}
                >
                  Add ChatGPT Message
                </MenuItem>
                <MenuItem
                  color="primary"
                  onClick={() =>
                    addNodeWithType(NodeType.ChatGPTChatCompletionNode)
                  }
                >
                  Add ChatGPT Chat Completion
                </MenuItem>
                <MenuItem
                  color="primary"
                  onClick={() =>
                    addNodeWithType(NodeType.JavaScriptFunctionNode)
                  }
                >
                  Add JavaScript
                </MenuItem>
                <MenuItem
                  color="primary"
                  onClick={() => addNodeWithType(NodeType.OutputNode)}
                >
                  Add Output
                </MenuItem>
              </Menu>
            </Dropdown>
            <Button color="success" onClick={runFlow}>
              Run
            </Button>
          </>
        ) : (
          <>
            <Button
              color="primary"
              onClick={() => addNodeWithType(NodeType.InputNode)}
            >
              Add Input
            </Button>
            <Button
              color="primary"
              onClick={() => addNodeWithType(NodeType.ChatGPTMessageNode)}
            >
              Add ChatGPT Message
            </Button>
            <Button
              color="primary"
              onClick={() =>
                addNodeWithType(NodeType.ChatGPTChatCompletionNode)
              }
            >
              Add ChatGPT Chat Completion
            </Button>
            <Button
              color="primary"
              onClick={() => addNodeWithType(NodeType.JavaScriptFunctionNode)}
            >
              Add JavaScript
            </Button>
            <Button
              color="primary"
              onClick={() => addNodeWithType(NodeType.OutputNode)}
            >
              Add Output
            </Button>
            <Button color="success" onClick={runFlow}>
              Run
            </Button>
          </>
        )}
      </LeftAligned>
      <RightAligned>
        <FormControl size="md" orientation="horizontal">
          <FormLabel sx={{ cursor: "pointer" }}>Evaluation Mode</FormLabel>
          <ToggleButtonGroup
            size="sm"
            value={detailPanelContentType}
            onChange={(e, newValue) => {
              if (newValue == null) return;
              setDetailPanelContentType(newValue);
            }}
          >
            <Button value={DetailPanelContentType.Off}>Off</Button>
            <Button value={DetailPanelContentType.EvaluationModeSimple}>
              Simple
            </Button>
            <Button value={DetailPanelContentType.EvaluationModeCSV}>
              CSV
            </Button>
          </ToggleButtonGroup>
        </FormControl>
      </RightAligned>
    </Container>
  );
}
