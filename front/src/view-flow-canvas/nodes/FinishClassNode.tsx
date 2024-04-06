import styled from '@emotion/styled';
import { useMemo } from 'react';
import { Position, useUpdateNodeInternals } from 'reactflow';

import {
  ConditionTarget,
  ConnectorType,
  NodeClass,
  NodeType,
  OutputNodeAllLevelConfig,
  getNodeDefinitionForNodeTypeName,
  type GenericChatbotFinishNodeAllLevelConfig,
} from 'flow-models';

import NodeTargetConditionHandle from 'components/node-connector/condition/NodeTargetConditionHandle';
import {
  VariableConfig,
  type VariableDefinition,
} from 'components/node-connector/types';
import NodeRenamableVariableList from 'components/node-connector/variable/NodeRenamableVariableList';
import { useFlowStore } from 'state-flow/flow-store';
import { selectVariables } from 'state-flow/util/state-utils';

import NodeBox from '../node-box/NodeBox';
import NodeBoxHeaderSection from '../node-box/NodeBoxHeaderSection';

type Props = {
  nodeId: string;
  isNodeReadOnly: boolean;
  nodeConfig: OutputNodeAllLevelConfig | GenericChatbotFinishNodeAllLevelConfig;
  conditionTarget: ConditionTarget;
};

function FinishClassNode(props: Props) {
  const updateNodeInternals = useUpdateNodeInternals();

  const connectors = useFlowStore((s) => s.getFlowContent().connectors);
  const addVariable = useFlowStore((s) => s.addConnector);

  const nodeDefinition = useMemo(
    () => getNodeDefinitionForNodeTypeName(props.nodeConfig.type),
    [props.nodeConfig.type],
  );

  const nodeInputVariables = useMemo(() => {
    return selectVariables(props.nodeId, ConnectorType.NodeInput, connectors);
  }, [props.nodeId, connectors]);

  return (
    <>
      <NodeTargetConditionHandle
        nodeId={props.nodeId}
        conditionId={props.conditionTarget.id}
      />
      <NodeBox nodeType={NodeType.OutputNode}>
        <NodeBoxHeaderSection
          nodeClass={NodeClass.Finish}
          isNodeReadOnly={props.isNodeReadOnly}
          title={nodeDefinition.label}
          nodeId={props.nodeId}
          showAddVariableButton={!!nodeDefinition.canUserAddIncomingVariables}
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
            variableConfigs={nodeInputVariables.map<VariableConfig>((v) => ({
              id: v.id,
              name: v.name,
              isGlobal: v.isGlobal,
              globalVariableId: v.globalVariableId,
            }))}
            variableDefinitions={nodeInputVariables.map<VariableDefinition>(
              (variable) => {
                const incomingVariableConfig =
                  nodeDefinition.fixedIncomingVariables?.[variable.name];

                return {
                  isVariableFixed: incomingVariableConfig != null,
                  helperMessage: incomingVariableConfig?.helperMessage,
                };
              },
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

export default FinishClassNode;
