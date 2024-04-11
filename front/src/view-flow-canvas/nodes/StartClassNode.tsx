import styled from '@emotion/styled';
import { useMemo } from 'react';
import { Position, useUpdateNodeInternals } from 'reactflow';

import {
  ConnectorType,
  GenericChatbotStartNodeAllLevelConfig,
  InputNodeAllLevelConfig,
  getNodeDefinitionForNodeTypeName,
  type LoopStartNodeAllLevelConfig,
} from 'flow-models';

import NodeRegularOutgoingConditionHandle from 'components/node-connector/condition/NodeRegularOutgoingConditionHandle';
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
  nodeConfig:
    | InputNodeAllLevelConfig
    | LoopStartNodeAllLevelConfig
    | GenericChatbotStartNodeAllLevelConfig;
};

function StartClassNode(props: Props) {
  const updateNodeInternals = useUpdateNodeInternals();

  const connectors = useFlowStore((s) => s.getFlowContent().connectors);
  const addVariable = useFlowStore((s) => s.addConnector);

  const nodeDefinition = useMemo(
    () => getNodeDefinitionForNodeTypeName(props.nodeConfig.type),
    [props.nodeConfig.type],
  );

  const nodeOutputVariables = useMemo(() => {
    return selectVariables(props.nodeId, ConnectorType.NodeOutput, connectors);
  }, [props.nodeId, connectors]);

  return (
    <>
      <NodeRegularOutgoingConditionHandle nodeId={props.nodeId} />
      <NodeBox nodeType={props.nodeConfig.type}>
        <NodeBoxHeaderSection
          nodeClass={props.nodeConfig.class}
          nodeId={props.nodeId}
          isNodeReadOnly={props.isNodeReadOnly}
          title={props.nodeConfig.nodeName}
          subTitle={nodeDefinition.label}
          showAddVariableButton={!!nodeDefinition.canUserAddNodeOutputVariable}
          onClickAddVariableButton={() => {
            addVariable(
              props.nodeId,
              ConnectorType.NodeOutput,
              nodeOutputVariables.length,
            );
            updateNodeInternals(props.nodeId);
          }}
        />
        <GenericContainer>
          <NodeRenamableVariableList
            showConnectorHandle={Position.Right}
            nodeId={props.nodeId}
            isNodeReadOnly={props.isNodeReadOnly}
            variableConfigs={nodeOutputVariables.map<VariableConfig>(
              (variable) => ({
                id: variable.id,
                name: variable.name,
                isGlobal: variable.isGlobal,
                globalVariableId: variable.globalVariableId,
              }),
            )}
            variableDefinitions={nodeOutputVariables.map<VariableDefinition>(
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

export default StartClassNode;
