import { DragOverlay } from '@dnd-kit/core';
import { useMemo } from 'react';

import { NodeType, getNodeDefinitionForNodeTypeName } from 'flow-models';

import { useFlowStore } from 'state-flow/flow-store';

import NodeConfigPaneContainer from '../left-side-pane-base-ui/NodeConfigPaneContainer';
import NodeCard from './NodeCard';

function AddNodePane() {
  const draggingNodeTypeForAddingNode = useFlowStore(
    (s) => s.draggingNodeTypeForAddingNode,
  );

  const options = useMemo(() => {
    return Object.values(NodeType).map((nodeType) => {
      const nodeDefinition = getNodeDefinitionForNodeTypeName(nodeType);
      return {
        nodeType,
        label: nodeDefinition.label,
      };
    });
  }, []);

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
