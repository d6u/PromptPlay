import NodeRenamableVariableList from 'components/node-connector/variable/NodeRenamableVariableList';
import { NodeKind } from 'flow-models';
import { useFlowStore } from 'state-flow/flow-store';

type Props = {
  nodeId: string;
};

function InspectorInputVariables(props: Props) {
  const nodeConfig = useFlowStore(
    (s) => s.getFlowContent().nodeConfigs[props.nodeId],
  );

  const variableIds =
    nodeConfig.kind === NodeKind.Start
      ? nodeConfig.outputVariableIds
      : nodeConfig.inputVariableIds;

  const updateNodeConfig = useFlowStore((s) => s.updateNodeConfig);

  return (
    <NodeRenamableVariableList
      nodeId={props.nodeId}
      variableIds={variableIds}
      onVariableIdsChange={(value) => {
        if (nodeConfig.kind === NodeKind.Start) {
          updateNodeConfig(props.nodeId, { outputVariableIds: value });
        } else {
          updateNodeConfig(props.nodeId, { inputVariableIds: value });
        }
      }}
      isListSortable={true}
    />
  );
}

export default InspectorInputVariables;
