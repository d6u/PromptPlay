import styled from '@emotion/styled';
import {
  Button,
  Dropdown,
  FormControl,
  FormLabel,
  IconButton,
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
import {
  FlowRouteTab,
  pathToFlowBatchTestTab,
  pathToFlowCanvasTab,
  useFlowRouteSubRouteHandle,
} from 'generic-util/route-utils';
import IconThreeDots from 'icons/IconThreeDots';
import { useCallback, useContext, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStoreApi } from 'reactflow';
import { BatchTestTab } from 'route-batch-test/utils/types';
import RouteFlowContext from 'route-flow/common/RouteFlowContext';
import { useStoreFromFlowStoreContext } from 'route-flow/store/FlowStoreContext';
import { DetailPanelContentType } from 'route-flow/store/store-flow-state-types';
import { NODE_BOX_WIDTH } from 'view-flow-canvas/ui-constants';
import { useStore } from 'zustand';
import PresetSelector from './preset-selector/PresetSelector';

function SubHeaderView() {
  const navigate = useNavigate();

  const flowTabType = useFlowRouteSubRouteHandle((handle) => handle.tabType);

  const { isCurrentUserOwner, spaceId } = useContext(RouteFlowContext);
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
  const selectedBatchTestTab = useStore(
    flowStore,
    (s) => s.selectedBatchTestTab,
  );
  const setSelectedBatchTestTab = useStore(
    flowStore,
    (s) => s.setSelectedBatchTestTab,
  );

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
          {flowTabType === FlowRouteTab.Canvas ? (
            <SubHeaderActionsWrapper>
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
            </SubHeaderActionsWrapper>
          ) : (
            <BatchTestToggleButtonGroup
              size="sm"
              value={selectedBatchTestTab}
              onChange={(e, newValue) => {
                setSelectedBatchTestTab(newValue as BatchTestTab);
              }}
            >
              <Button value={BatchTestTab.RunTests}>Run Tests</Button>
              <Button value={BatchTestTab.UploadCsv}>Upload CSV</Button>
            </BatchTestToggleButtonGroup>
          )}
          {flowTabType === FlowRouteTab.Canvas ? null : (
            <MiddleContent>
              <PresetSelector />
            </MiddleContent>
          )}
          {flowTabType === FlowRouteTab.Canvas && (
            <SavingIndicator color="success" level="body-sm" variant="plain">
              {isFlowContentSaving
                ? 'Saving...'
                : isFlowContentDirty
                  ? 'Save pending'
                  : 'Saved'}
            </SavingIndicator>
          )}
          {flowTabType === FlowRouteTab.Canvas && (
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
          )}
          {false && (
            <Dropdown>
              <MoreMenuButton
                slots={{ root: IconButton }}
                slotProps={{ root: { color: 'neutral' } }}
              >
                <IconThreeDots style={{ rotate: '90deg', width: '18px' }} />
              </MoreMenuButton>
              <Menu>
                <MenuItem color="neutral">Placeholder</MenuItem>
              </Menu>
            </Dropdown>
          )}
        </>
      )}
    </Container>
  );
}

// ANCHOR: UI Components

const Container = styled.div`
  grid-area: sub-header;
  display: grid;
  grid-template-columns: max-content max-content max-content auto max-content max-content max-content;
  grid-template-rows: 1fr;
  grid-template-areas: 'tab-switcher left-pane-toggle sub-header-actions middle saving-indicator right-pane-toggle more-menu';
  gap: 10px;
  align-items: center;
  border-bottom: 1px solid #ececf1;
  padding: 0 20px;
`;

const TabSwitcherToggleButtonGroup = styled(ToggleButtonGroup)`
  grid-area: tab-switcher;
`;

const SubHeaderActionsWrapper = styled.div`
  grid-area: sub-header-actions;
  display: flex;
  gap: 10px;
`;

const BatchTestToggleButtonGroup = styled(ToggleButtonGroup)`
  grid-area: sub-header-actions;
`;

const MiddleContent = styled.div`
  grid-area: middle;
`;

const SavingIndicator = styled(Typography)`
  grid-area: saving-indicator;
`;

const RightPaneToggle = styled(FormControl)`
  grid-area: right-pane-toggle;
`;

const MoreMenuButton = styled(MenuButton)`
  grid-area: more-menu;
`;

export default SubHeaderView;
