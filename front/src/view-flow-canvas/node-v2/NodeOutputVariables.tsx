import { css } from '@emotion/react';
import type { NodeOutputVariable } from 'flow-models';
import { useMemo } from 'react';
import { Handle, Position } from 'reactflow';
import { useFlowStore } from 'state-flow/flow-store';

type Props = {
  nodeId: string;
};

function NodeOutputVariables(props: Props) {
  const nodeConfig = useFlowStore(
    (s) => s.getFlowContent().nodeConfigs[props.nodeId],
  );

  const connectors = useFlowStore((s) => s.getFlowContent().connectors);

  const outputVariables = useMemo((): NodeOutputVariable[] => {
    return nodeConfig.outputVariableIds.map(
      (variableId) => connectors[variableId] as NodeOutputVariable,
    );
  }, [connectors, nodeConfig.outputVariableIds]);

  return (
    <div
      css={css`
        position: relative;
      `}
    >
      {outputVariables.map((variable) => (
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
              right: -8px;
            `}
            type="source"
            position={Position.Right}
          />
          <div
            css={css`
              font-family: menlo, monospace;
              font-size: 14px;
              text-align: right;
            `}
          >
            {variable.name}
          </div>
        </div>
      ))}
    </div>
  );
}

export default NodeOutputVariables;
