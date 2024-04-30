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

import { NodeRunState } from 'run-flow';
import NodeBox from '../node-box/NodeBox';
import NodeBoxHeaderSection from '../node-box/NodeBoxHeaderSection';

type Props = {
  // reactflow props
  selected: boolean;
  // custom props
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
  const nodeState = useFlowStore(
    (s) =>
      s.getFlowContent().runFlowStates.nodeStates[props.nodeId] ??
      NodeRunState.PENDING,
  );

  const nodeDefinition = useMemo(
    () => getNodeDefinitionForNodeTypeName(props.nodeConfig.type),
    [props.nodeConfig.type],
  );

  const nodeOutputVariables = useMemo(() => {
    return selectVariables(
      props.nodeConfig,
      ConnectorType.NodeOutput,
      connectors,
    );
  }, [props.nodeConfig, connectors]);

  return (
    <>
      <NodeRegularOutgoingConditionHandle nodeId={props.nodeId} />
      <NodeBox selected={props.selected} nodeState={nodeState}>
        <NodeBoxHeaderSection
          nodeKind={props.nodeConfig.kind}
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
