import styled from '@emotion/styled';
import { useMemo } from 'react';
import { Position, useUpdateNodeInternals } from 'reactflow';

import { ConnectorType, NodeType, OutputNodeAllLevelConfig } from 'flow-models';

import NodeVariablesEditableList from 'components/node-connector/NodeVariablesEditableList';
import { useFlowStore } from 'state-flow/flow-store';
import { selectVariables } from 'state-flow/util/state-utils';

import NodeBox from '../node-box/NodeBox';
import NodeBoxHeaderSection from '../node-box/NodeBoxHeaderSection';

type Props = {
  nodeId: string;
  isNodeReadOnly: boolean;
  nodeConfig: OutputNodeAllLevelConfig;
};

function OutputNode(props: Props) {
  const updateNodeInternals = useUpdateNodeInternals();

  const variables = useFlowStore((s) => s.getFlowContent().variablesDict);
  const addVariable = useFlowStore((s) => s.addVariable);

  const flowOutputVariables = useMemo(() => {
    return selectVariables(props.nodeId, ConnectorType.FlowOutput, variables);
  }, [props.nodeId, variables]);

  return (
    <>
      <NodeBox nodeType={NodeType.OutputNode}>
        <NodeBoxHeaderSection
          isNodeReadOnly={props.isNodeReadOnly}
          title="Output"
          nodeId={props.nodeId}
          showAddVariableButton={true}
          onClickAddVariableButton={() => {
            addVariable(
              props.nodeId,
              ConnectorType.FlowOutput,
              flowOutputVariables.length,
            );
            updateNodeInternals(props.nodeId);
          }}
        />
        <GenericContainer>
          <NodeVariablesEditableList
            showConnectorHandle={Position.Left}
            nodeId={props.nodeId}
            isNodeReadOnly={props.isNodeReadOnly}
            variableConfigs={flowOutputVariables.map((output) => ({
              id: output.id,
              name: output.name,
              isGlobal: false,
              globalVariableId: null,
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

export default OutputNode;
