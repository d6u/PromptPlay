import styled from '@emotion/styled';
import { Button, Dropdown, Menu, MenuButton, MenuItem } from '@mui/joy';
import { useCallback, useContext, useMemo } from 'react';
import { useStoreApi } from 'reactflow';

import {
  NodeType,
  getAllNodeTypes,
  getNodeDefinitionForNodeTypeName,
} from 'flow-models';

import RouteFlowContext from 'state-flow/context/FlowRouteContext';
import { useFlowStore } from 'state-flow/context/FlowStoreContext';
import { RightSidePanelType } from 'state-flow/types';
import { NODE_BOX_WIDTH } from 'view-flow-canvas/ui-constants';

function SubTabActionsCanvas() {
  const { isCurrentUserOwner } = useContext(RouteFlowContext);

  const storeApi = useStoreApi();

  const isRunning = useFlowStore((s) => s.isRunning);
  const detailPanelContentType = useFlowStore((s) => s.detailPanelContentType);
  const addNode = useFlowStore((s) => s.addNode);
  const runFlow = useFlowStore((s) => s.runFlow);
  const stopRunningFlow = useFlowStore((s) => s.stopRunningFlow);

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

  const runButtonConfig = {
    shouldShowRunButton: detailPanelContentType !== RightSidePanelType.Tester,
    label: isRunning ? 'Stop' : 'Run',
    onClick: isRunning ? stopRunningFlow : runFlow,
  };

  return (
    <Container>
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
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  gap: 10px;
`;

export default SubTabActionsCanvas;