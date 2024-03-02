import styled from '@emotion/styled';
import { useMemo } from 'react';
import { Position, useUpdateNodeInternals } from 'reactflow';

import { ConnectorType, InputNodeAllLevelConfig, NodeType } from 'flow-models';

import NodeVariablesEditableList from 'components/node-connector/NodeVariablesEditableList';
import { useFlowStore } from 'state-flow/flow-store';
import { selectVariables } from 'state-flow/util/state-utils';

import NodeBox from '../node-box/NodeBox';
import NodeBoxHeaderSection from '../node-box/NodeBoxHeaderSection';

type Props = {
  nodeId: string;
  isNodeReadOnly: boolean;
  nodeConfig: InputNodeAllLevelConfig;
};

function InputNode(props: Props) {
  const updateNodeInternals = useUpdateNodeInternals();

  const variables = useFlowStore((s) => s.getFlowContent().variablesDict);
  const addVariable = useFlowStore((s) => s.addVariable);

  const flowInputVariables = useMemo(() => {
    return selectVariables(props.nodeId, ConnectorType.FlowInput, variables);
  }, [props.nodeId, variables]);

  return (
    <>
      <NodeBox nodeType={NodeType.InputNode}>
        <NodeBoxHeaderSection
          isNodeReadOnly={props.isNodeReadOnly}
          title="Input"
          nodeId={props.nodeId}
          showAddVariableButton={true}
          onClickAddVariableButton={() => {
            addVariable(
              props.nodeId,
              ConnectorType.FlowInput,
              flowInputVariables.length,
            );
            updateNodeInternals(props.nodeId);
          }}
        />
        <GenericContainer>
          <NodeVariablesEditableList
            showConnectorHandle={Position.Right}
            nodeId={props.nodeId}
            isNodeReadOnly={props.isNodeReadOnly}
            variableConfigs={flowInputVariables.map((variable) => ({
              id: variable.id,
              name: variable.name,
              isReadOnly: false,
            }))}
          />
        </GenericContainer>
      </NodeBox>
    </>
  );
}

const GenericContainer = styled.div`
  padding-left: 10px;
  padding-right: 10px;
`;

export default InputNode;
