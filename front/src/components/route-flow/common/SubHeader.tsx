import styled from '@emotion/styled';
import {
  Button,
  Dropdown,
  FormControl,
  FormLabel,
  Menu,
  MenuButton,
  MenuItem,
  Switch,
  ToggleButtonGroup,
  Typography,
} from '@mui/joy';
import {
  NodeType,
  getAllNodeTypes,
  getNodeDefinitionForNodeTypeName,
} from 'flow-models';
import { useCallback, useContext, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStoreApi } from 'reactflow';
import { useStore } from 'zustand';
import {
  FlowRouteTab,
  pathToFlowBatchTestTab,
  pathToFlowCanvasTab,
} from '../../../utils/route-utils';
import { NODE_BOX_WIDTH } from '../../route-canvas/flow-canvas/nodes/node-common/NodeBox';
import { useStoreFromFlowStoreContext } from '../store/FlowStoreContext';
import { DetailPanelContentType } from '../store/store-flow-state-types';
import RouteFlowContext from './RouteFlowContext';

export default function SubHeader() {
  const navigate = useNavigate();

  const { isCurrentUserOwner, spaceId, flowTabType } =
    useContext(RouteFlowContext);
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

  const isTesterOpen = useMemo(() => {
    return detailPanelContentType != DetailPanelContentType.Off;
  }, [detailPanelContentType]);

  const options = useMemo(() => {
    return getAllNodeTypes()
      .map((nodeType) => ({
        nodeType,
        nodeDefinition: getNodeDefinitionForNodeTypeName(nodeType),
      }))
      .filter(({ nodeDefinition }) => nodeDefinition.isEnabledInToolbar)
      .map(({ nodeType, nodeDefinition }) => {
        return {
          label: `Add ${nodeDefinition.toolbarLabel}`,
          onClick: () => addNodeWithType(nodeType),
        };
      });
  }, [addNodeWithType]);

  const runButtonConfig = {
    shouldShowRunButton:
      detailPanelContentType !== DetailPanelContentType.EvaluationModeSimple &&
      detailPanelContentType !== DetailPanelContentType.EvaluationModeCSV,
    label: isRunning ? 'Stop' : 'Run',
    onClick: isRunning ? stopRunningFlow : runFlow,
  };

  return (
    <Container>
      {isCurrentUserOwner && (
        <>
          <TabSwitcherToggleButtonGroup
            size="sm"
            value={flowTabType}
            onChange={(e, newValue) => {
              switch (newValue as FlowRouteTab) {
                case FlowRouteTab.Canvas:
                  navigate(pathToFlowCanvasTab(spaceId));
                  break;
                case FlowRouteTab.BatchTest:
                  navigate(pathToFlowBatchTestTab(spaceId));
                  break;
              }
            }}
          >
            <Button value={FlowRouteTab.Canvas}>Canvas</Button>
            <Button value={FlowRouteTab.BatchTest}>Batch Test</Button>
          </TabSwitcherToggleButtonGroup>
          <LeftPaneToggleWrapper>
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
          </LeftPaneToggleWrapper>
          <SavingIndicator color="success" level="body-sm" variant="plain">
            {isFlowContentSaving
              ? 'Saving...'
              : isFlowContentDirty
                ? 'Save pending'
                : 'Saved'}
          </SavingIndicator>
          <RightPaneToggle size="md" orientation="horizontal">
            <FormLabel sx={{ cursor: 'pointer' }}>Tester</FormLabel>
            <Switch
              color="neutral"
              size="md"
              variant={isTesterOpen ? 'solid' : 'outlined'}
              // Reverse the value to match the position of the switch
              // with the open state of the right panel
              checked={!isTesterOpen}
              onChange={(event) => {
                setDetailPanelContentType(
                  event.target.checked
                    ? DetailPanelContentType.Off
                    : DetailPanelContentType.EvaluationModeSimple,
                );
              }}
            />
          </RightPaneToggle>
        </>
      )}
    </Container>
  );
}

const Container = styled.div`
  grid-area: sub-header;
  display: grid;
  grid-template-columns: max-content max-content auto max-content max-content max-content;
  grid-template-rows: 1fr;
  grid-template-areas: 'tab-switcher left-pane-toggle . saving-indicator right-pane-toggle more-menu';
  gap: 10px;
  align-items: center;
  border-bottom: 1px solid #ececf1;
  padding: 0 20px;
`;

const TabSwitcherToggleButtonGroup = styled(ToggleButtonGroup)`
  grid-area: tab-switcher;
`;

const LeftPaneToggleWrapper = styled.div`
  grid-area: left-pane-toggle;
  display: flex;
  gap: 10px;
`;

const SavingIndicator = styled(Typography)`
  grid-area: saving-indicator;
  margin-right: 20px;
`;

const RightPaneToggle = styled(FormControl)`
  grid-area: right-pane-toggle;
`;
