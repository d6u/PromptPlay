import styled from '@emotion/styled';
import { useMemo } from 'react';
import { Position, useUpdateNodeInternals } from 'reactflow';

import { ConnectorType, InputNodeAllLevelConfig, NodeType } from 'flow-models';

import { VariableConfig } from 'components/node-connector/types';
import NodeRenamableVariableList from 'components/node-connector/variable/NodeRenamableVariableList';
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
  const addVariable = useFlowStore((s) => s.addConnector);

  const flowInputVariables = useMemo(() => {
    return selectVariables(props.nodeId, ConnectorType.NodeOutput, variables);
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
              ConnectorType.NodeOutput,
              flowInputVariables.length,
            );
            updateNodeInternals(props.nodeId);
          }}
        />
        <GenericContainer>
          <NodeRenamableVariableList
            showConnectorHandle={Position.Right}
            nodeId={props.nodeId}
            isNodeReadOnly={props.isNodeReadOnly}
            variableConfigs={flowInputVariables.map<VariableConfig>(
              (variable) => ({
                id: variable.id,
                name: variable.name,
                isGlobal: variable.isGlobal,
                globalVariableId: variable.globalVariableId,
                isVariableFixed: false,
              }),
            )}
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
