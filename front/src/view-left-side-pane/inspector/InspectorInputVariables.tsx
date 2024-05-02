import NodeRenamableVariableList from 'components/node-connector/variable/NodeRenamableVariableList';
import { ConnectorType, NodeKind } from 'flow-models';
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
  const addVariable = useFlowStore((s) => s.addConnector);

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
      labelForAddVariableButton={
        nodeConfig.kind === NodeKind.Start
          ? 'Add input variable for flow'
          : 'Add input variable'
      }
      onAddVariable={() => {
        addVariable(
          props.nodeId,
          nodeConfig.kind === NodeKind.Start
            ? ConnectorType.NodeOutput
            : ConnectorType.NodeInput,
        );
      }}
      isListSortable={true}
    />
  );
}

export default InspectorInputVariables;
