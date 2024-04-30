import type { NodeInputVariable } from 'flow-models';
import { useMemo } from 'react';
import { useFlowStore } from 'state-flow/flow-store';

type Props = {
  nodeId: string;
};

function NodeInputVariables(props: Props) {
  const nodeConfig = useFlowStore(
    (s) => s.getFlowContent().nodeConfigs[props.nodeId],
  );

  const connectors = useFlowStore((s) => s.getFlowContent().connectors);

  const inputVariables: NodeInputVariable[] = useMemo(() => {
    return nodeConfig.inputVariableIds.map(
      (variableId) => connectors[variableId] as NodeInputVariable,
    );
  }, [connectors, nodeConfig.inputVariableIds]);

  return (
    <div>
      {inputVariables.map((variable) => (
        <div key={variable.id}>{variable.name}</div>
      ))}
    </div>
  );
}

export default NodeInputVariables;
