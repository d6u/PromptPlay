import styled from '@emotion/styled';
import {
  Button,
  Dropdown,
  FormControl,
  FormLabel,
  Menu,
  MenuButton,
  MenuItem,
  ToggleButtonGroup,
  Typography,
} from '@mui/joy';
import { NodeType } from 'flow-models/v3-flow-content-types';
import { useCallback, useContext, useEffect, useState } from 'react';
import { useStoreApi } from 'reactflow';
import { useStore } from 'zustand';
import FlowContext from '../FlowContext';
import { NODE_BOX_WIDTH } from '../flow-canvas/nodes/node-common/NodeBox';
import { useStoreFromFlowStoreContext } from '../store/FlowStoreContext';
import { DetailPanelContentType } from '../store/store-flow-state-types';

export default function ToolBar() {
  const { isCurrentUserOwner } = useContext(FlowContext);
  const flowStore = useStoreFromFlowStoreContext();

  const isRunning = useStore(flowStore, (s) => s.isRunning);
  const isFlowContentDirty = useStore(flowStore, (s) => s.isFlowContentDirty);
  const isFlowContentSaving = useStore(flowStore, (s) => s.isFlowContentSaving);
  const detailPanelContentType = useStore(
    flowStore,
    (s) => s.detailPanelContentType,
  );
  const setDetailPanelContentType = useStore(
    flowStore,
    (s) => s.setDetailPanelContentType,
  );
  const addNode = useStore(flowStore, (s) => s.addNode);
  const runFlow = useStore(flowStore, (s) => s.runFlow);
  const stopRunningFlow = useStore(flowStore, (s) => s.stopRunningFlow);

  const storeApi = useStoreApi();

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
    [addNode, isCurrentUserOwner, storeApi],
  );

  const [useNarrowLayout, setUseNarrowLayout] = useState(
    window.innerWidth < USE_NARROW_LAYOUT_BREAKPOINT,
  );

  useEffect(() => {
    function handleResize() {
      if (window.innerWidth < USE_NARROW_LAYOUT_BREAKPOINT) {
        setUseNarrowLayout(true);
      } else {
        setUseNarrowLayout(false);
      }
    }
    window.addEventListener('resize', handleResize, { passive: true });
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const options = [
    { label: 'Add Input', onClick: () => addNodeWithType(NodeType.InputNode) },
    {
      label: 'Add Output',
      onClick: () => addNodeWithType(NodeType.OutputNode),
    },
    {
      label: 'Add JavaScript',
      onClick: () => addNodeWithType(NodeType.JavaScriptFunctionNode),
    },
    {
      label: 'Add Text',
      onClick: () => addNodeWithType(NodeType.TextTemplate),
    },
    {
      label: 'Add ChatGPT Message',
      onClick: () => addNodeWithType(NodeType.ChatGPTMessageNode),
    },
    {
      label: 'Add ChatGPT Chat Completion',
      onClick: () => addNodeWithType(NodeType.ChatGPTChatCompletionNode),
    },
    {
      label: 'Add Hugging Face Inference',
      onClick: () => addNodeWithType(NodeType.HuggingFaceInference),
    },
    {
      label: 'Add Eleven Labs Text to Speech',
      onClick: () => addNodeWithType(NodeType.ElevenLabs),
    },
  ];

  const runButtonConfig = {
    shouldShowRunButton:
      detailPanelContentType !== DetailPanelContentType.EvaluationModeSimple &&
      detailPanelContentType !== DetailPanelContentType.EvaluationModeCSV,
    label: isRunning ? 'Stop' : 'Run',
    onClick: isRunning ? stopRunningFlow : runFlow,
  };

  return (
    <Container>
      <LeftAligned>
        {useNarrowLayout ? (
          <>
            <Dropdown>
              <MenuButton color="primary">Add</MenuButton>
              <Menu>
                {options.map((option, i) => (
                  <MenuItem key={i} color="primary" onClick={option.onClick}>
                    {option.label}
                  </MenuItem>
                ))}
              </Menu>
            </Dropdown>
            {runButtonConfig.shouldShowRunButton && (
              <Button
                color={isRunning ? 'danger' : 'success'}
                onClick={runButtonConfig.onClick}
              >
                {runButtonConfig.label}
              </Button>
            )}
          </>
        ) : (
          <>
            {options.map((option, i) => (
              <Button key={i} color="primary" onClick={option.onClick}>
                {option.label}
              </Button>
            ))}
            {runButtonConfig.shouldShowRunButton && (
              <Button
                color={isRunning ? 'danger' : 'success'}
                onClick={runButtonConfig.onClick}
              >
                {runButtonConfig.label}
              </Button>
            )}
          </>
        )}
      </LeftAligned>
      <RightAligned>
        <SavingIndicator color="success" level="body-sm" variant="plain">
          {isFlowContentSaving
            ? 'Saving...'
            : isFlowContentDirty
              ? 'Save pending'
              : 'Saved'}
        </SavingIndicator>
        <FormControl size="md" orientation="horizontal">
          <FormLabel sx={{ cursor: 'pointer' }}>Evaluation Mode</FormLabel>
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

const USE_NARROW_LAYOUT_BREAKPOINT = 2000;

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
  gap: 10px;
`;

const RightAligned = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 5px;
`;

const SavingIndicator = styled(Typography)`
  margin-right: 20px;
`;
