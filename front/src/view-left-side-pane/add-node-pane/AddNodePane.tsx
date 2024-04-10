import { useCallback, useContext, useMemo } from 'react';
import { useStoreApi } from 'reactflow';

import {
  NodeType,
  getNodeDefinitionForNodeTypeName,
  type NodeTypeEnum,
} from 'flow-models';

import RouteFlowContext from 'state-flow/context/FlowRouteContext';
import { useFlowStore } from 'state-flow/flow-store';
import { NODE_BOX_WIDTH } from 'view-flow-canvas/constants';

import { DragOverlay } from '@dnd-kit/core';
import NodeConfigPaneContainer from '../left-side-pane-base-ui/NodeConfigPaneContainer';
import NodeCard from './NodeCard';

function AddNodePane() {
  const { isCurrentUserOwner } = useContext(RouteFlowContext);

  const reactflowStoreApi = useStoreApi();

  const draggingNodeTypeForAddingNode = useFlowStore(
    (s) => s.draggingNodeTypeForAddingNode,
  );
  const addNode = useFlowStore((s) => s.addNode);

  const addNodeWithType = useCallback(
    (type: NodeTypeEnum) => {
      if (!isCurrentUserOwner) return;

      const {
        width,
        transform: [transformX, transformY, zoomLevel],
      } = reactflowStoreApi.getState();

      const zoomMultiplier = 1 / zoomLevel;

      // Figure out the center of the current viewport
      const centerX =
        -transformX * zoomMultiplier + (width * zoomMultiplier) / 2;

      // Put the node at the 200px below the viewport top
      const centerY = -transformY * zoomMultiplier + 200 * zoomMultiplier;

      addNode(type, centerX - NODE_BOX_WIDTH / 2, centerY);
      addNode(type, centerX - NODE_BOX_WIDTH / 2, centerY);
    },
    [addNode, isCurrentUserOwner, reactflowStoreApi],
  );

  const options = useMemo(() => {
    return Object.values(NodeType)
      .map((nodeType) => ({
        nodeType,
        nodeDefinition: getNodeDefinitionForNodeTypeName(nodeType),
      }))
      .map(({ nodeType, nodeDefinition }) => {
        return {
          nodeType,
          label: nodeDefinition.label,
          onClick: () => addNodeWithType(nodeType),
        };
      });
  }, [addNodeWithType]);

  const draggingNodeLabel = useMemo(() => {
    if (!draggingNodeTypeForAddingNode) {
      return null;
    }
    const nodeDefinition = getNodeDefinitionForNodeTypeName(
      draggingNodeTypeForAddingNode,
    );
    return nodeDefinition.label;
  }, [draggingNodeTypeForAddingNode]);

  return (
    <NodeConfigPaneContainer>
      {options.map((option, i) => (
        <NodeCard key={i} nodeType={option.nodeType} label={option.label} />
      ))}
      <DragOverlay dropAnimation={null}>
        {draggingNodeTypeForAddingNode && (
          <NodeCard
            nodeType={draggingNodeTypeForAddingNode}
            label={draggingNodeLabel!}
          />
        )}
      </DragOverlay>
    </NodeConfigPaneContainer>
  );
}

export default AddNodePane;
