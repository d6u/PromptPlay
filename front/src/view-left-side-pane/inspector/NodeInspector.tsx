import NodeRenamableVariableList from 'components/node-connector/variable/NodeRenamableVariableList';
import { useFlowStore } from 'state-flow/flow-store';
import NodeConfigPaneContainer from 'view-left-side-pane/left-side-pane-base-ui/NodeConfigPaneContainer';
import InspectorHeader from './InspectorHeader';

function NodeInspector() {
  const nodeId = useFlowStore((s) => s.canvasLeftPaneSelectedNodeId);

  const configExists = useFlowStore(
    (s) => nodeId != null && s.getFlowContent().nodeConfigs[nodeId] != null,
  );

  // NOTE: Do this check so we don't have to check for null in every child
  // component. This happens when the node is deleted.
  if (!configExists) {
    return null;
  }

  return (
    <NodeConfigPaneContainer>
      <InspectorHeader nodeId={nodeId!} />
      <NodeRenamableVariableList isListSortable={true} nodeId={nodeId!} />
    </NodeConfigPaneContainer>
  );
}

export default NodeInspector;
