import styled from '@emotion/styled';
import { Button, Dropdown, Menu, MenuButton, MenuItem } from '@mui/joy';
import { useCallback, useContext, useMemo } from 'react';
import { useStoreApi } from 'reactflow';

import {
  NodeTypeEnum,
  getAllNodeTypes,
  getNodeDefinitionForNodeTypeName,
} from 'flow-models';

import RouteFlowContext from 'state-flow/context/FlowRouteContext';
import { useFlowStore } from 'state-flow/context/FlowStoreContext';
import { NODE_BOX_WIDTH } from 'view-flow-canvas/constants';

function SubTabActionsCanvas() {
  const { isCurrentUserOwner } = useContext(RouteFlowContext);

  const storeApi = useStoreApi();

  const isRunning = useFlowStore((s) => s.isRunning);
  const addNode = useFlowStore((s) => s.addNode);
  const runFlow = useFlowStore((s) => s.runFlow);
  const stopRunningFlow = useFlowStore((s) => s.stopRunningFlow);

  const addNodeWithType = useCallback(
    (type: NodeTypeEnum) => {
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
      <Button
        color={isRunning ? 'danger' : 'success'}
        onClick={isRunning ? stopRunningFlow : runFlow}
      >
        {isRunning ? 'Stop' : 'Run'}
      </Button>
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  gap: 10px;
`;

export default SubTabActionsCanvas;
