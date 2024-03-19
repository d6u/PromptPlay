import styled from '@emotion/styled';
import { useMemo } from 'react';
import { Position, useUpdateNodeInternals } from 'reactflow';

import {
  ConditionTarget,
  ConnectorType,
  NodeType,
  OutputNodeAllLevelConfig,
} from 'flow-models';

import NodeTargetConditionHandle from 'components/node-connector/condition/NodeTargetConditionHandle';
import { VariableConfig } from 'components/node-connector/types';
import NodeRenamableVariableList from 'components/node-connector/variable/NodeRenamableVariableList';
import { useFlowStore } from 'state-flow/flow-store';
import { selectVariables } from 'state-flow/util/state-utils';

import NodeBox from '../node-box/NodeBox';
import NodeBoxHeaderSection from '../node-box/NodeBoxHeaderSection';

type Props = {
  nodeId: string;
  isNodeReadOnly: boolean;
  nodeConfig: OutputNodeAllLevelConfig;
  conditionTarget: ConditionTarget;
};

function OutputNode(props: Props) {
  const updateNodeInternals = useUpdateNodeInternals();

  const variables = useFlowStore((s) => s.getFlowContent().variablesDict);
  const addVariable = useFlowStore((s) => s.addConnector);

  const nodeInputVariables = useMemo(() => {
    return selectVariables(props.nodeId, ConnectorType.NodeInput, variables);
  }, [props.nodeId, variables]);

  return (
    <>
      <NodeTargetConditionHandle
        nodeId={props.nodeId}
        conditionId={props.conditionTarget.id}
      />
      <NodeBox nodeType={NodeType.OutputNode}>
        <NodeBoxHeaderSection
          isNodeReadOnly={props.isNodeReadOnly}
          title="Output"
          nodeId={props.nodeId}
          showAddVariableButton={true}
          onClickAddVariableButton={() => {
            addVariable(
              props.nodeId,
              ConnectorType.NodeInput,
              nodeInputVariables.length,
            );
            updateNodeInternals(props.nodeId);
          }}
        />
        <GenericContainer>
          <NodeRenamableVariableList
            showConnectorHandle={Position.Left}
            nodeId={props.nodeId}
            isNodeReadOnly={props.isNodeReadOnly}
            variableConfigs={nodeInputVariables.map<VariableConfig>(
              (nodeInputVariable) => ({
                id: nodeInputVariable.id,
                name: nodeInputVariable.name,
                isGlobal: nodeInputVariable.isGlobal,
                globalVariableId: nodeInputVariable.globalVariableId,
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

export default OutputNode;
