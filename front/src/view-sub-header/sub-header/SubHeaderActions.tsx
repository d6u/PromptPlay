import styled from '@emotion/styled';
import {
  Button,
  Dropdown,
  Menu,
  MenuButton,
  MenuItem,
  ToggleButtonGroup,
} from '@mui/joy';
import { useCallback, useContext, useMemo } from 'react';
import { useStoreApi } from 'reactflow';

import {
  NodeType,
  getAllNodeTypes,
  getNodeDefinitionForNodeTypeName,
} from 'flow-models';

import { FlowRouteTab, useFlowRouteSubRouteHandle } from 'generic-util/route';
import RouteFlowContext from 'state-flow/context/FlowRouteContext';
import { useFlowStore } from 'state-flow/context/FlowStoreContext';
import { BatchTestTab, RightSidePanelType } from 'state-flow/types';
import { NODE_BOX_WIDTH } from 'view-flow-canvas/ui-constants';

function SubHeaderActions() {
  const { isCurrentUserOwner } = useContext(RouteFlowContext);

  const flowTabType = useFlowRouteSubRouteHandle((handle) => handle.tabType);

  const storeApi = useStoreApi();

  const isRunning = useFlowStore((s) => s.isRunning);
  const selectedBatchTestTab = useFlowStore((s) => s.selectedBatchTestTab);
  const detailPanelContentType = useFlowStore((s) => s.detailPanelContentType);
  const runFlow = useFlowStore((s) => s.runFlow);
  const stopRunningFlow = useFlowStore((s) => s.stopRunningFlow);
  const setSelectedBatchTestTab = useFlowStore(
    (s) => s.setSelectedBatchTestTab,
  );
  const addNode = useFlowStore((s) => s.addNode);

  const runButtonConfig = {
    shouldShowRunButton: detailPanelContentType !== RightSidePanelType.Tester,
    label: isRunning ? 'Stop' : 'Run',
    onClick: isRunning ? stopRunningFlow : runFlow,
  };

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

  const options = useMemo(() => {
    return getAllNodeTypes()
      .map((nodeType) => ({
        nodeType,
        nodeDefinition: getNodeDefinitionForNodeTypeName(nodeType),
      }))
      .map(({ nodeType, nodeDefinition }) => {
        return {
          label: `Add ${nodeDefinition.label}`,
          onClick: () => addNodeWithType(nodeType),
        };
      });
  }, [addNodeWithType]);

  switch (flowTabType) {
    case FlowRouteTab.Canvas:
      return (
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
      );
    case FlowRouteTab.BatchTest:
      return (
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
      );
  }
}

const SubHeaderActionsWrapper = styled.div`
  grid-area: sub-header-actions;
  display: flex;
  gap: 10px;
`;

const BatchTestToggleButtonGroup = styled(ToggleButtonGroup)`
  grid-area: sub-header-actions;
`;

export default SubHeaderActions;
