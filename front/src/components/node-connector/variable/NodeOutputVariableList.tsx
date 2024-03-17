import NodeVariableResultItem from './NodeVariableResultItem';

type Props = {
  nodeId: string;
  nodeOutputVariables: {
    id: string;
    name: string;
    value: unknown;
  }[];
};

function NodeOutputVariableList(props: Props) {
  return props.nodeOutputVariables.map((variable) => {
    return (
      <NodeVariableResultItem
        key={variable.id}
        variableId={variable.id}
        variableName={variable.name}
        variableValue={variable.value}
        nodeId={props.nodeId}
      />
    );
  });
}

export default NodeOutputVariableList;
