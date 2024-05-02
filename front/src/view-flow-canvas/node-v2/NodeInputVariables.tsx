import { css } from '@emotion/react';
import type { NodeInputVariable } from 'flow-models';
import { useMemo } from 'react';
import { Handle, Position } from 'reactflow';
import { useFlowStore } from 'state-flow/flow-store';

type Props = {
  nodeId: string;
};

function NodeInputVariables(props: Props) {
  const nodeConfig = useFlowStore(
    (s) => s.getFlowContent().nodeConfigs[props.nodeId],
  );

  const connectors = useFlowStore((s) => s.getFlowContent().connectors);

  const inputVariables = useMemo((): NodeInputVariable[] => {
    return nodeConfig.inputVariableIds.map(
      (variableId) => connectors[variableId] as NodeInputVariable,
    );
  }, [connectors, nodeConfig.inputVariableIds]);

  return (
    <div
      css={css`
        position: relative;
      `}
    >
      {inputVariables.map((variable) => (
        <div
          key={variable.id}
          css={css`
            position: relative;
            padding-left: 10px;
            padding-right: 10px;
            margin-top: 5px;
            margin-bottom: 5px;
          `}
        >
          <Handle
            css={css`
              width: 14px;
              height: 14px;
              background: white;
              border: 2px solid #00b3ff;
              left: -8px;
            `}
            type="target"
            position={Position.Left}
          />
          <div
            css={css`
              font-family: menlo, monospace;
              font-size: 14px;
            `}
          >
            {variable.name}
          </div>
        </div>
      ))}
    </div>
  );
}

export default NodeInputVariables;
