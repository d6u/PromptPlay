import styled from '@emotion/styled';
import { Option } from '@mobily/ts-belt';
import { useMemo } from 'react';
import { Position, useUpdateNodeInternals } from 'reactflow';

import {
  ConditionNodeInstanceLevelConfig,
  ConnectorType,
  IncomingCondition,
  InputNodeInstanceLevelConfig,
  JavaScriptFunctionNodeInstanceLevelConfig,
  NodeClass,
  NodeConfig,
  NodeInputVariable,
  NodeOutputVariable,
  OutputNodeInstanceLevelConfig,
  getNodeDefinitionForNodeTypeName,
} from 'flow-models';

import NodeIncomingConditionHandle from 'components/node-connector/condition/NodeIncomingConditionHandle';
import NodeRenamableVariableList from 'components/node-connector/variable/NodeRenamableVariableList';
import NodeAccountLevelFields from 'components/node-fields/NodeAccountLevelFields';
import NodeInstanceLevelFields from 'components/node-fields/NodeInstanceLevelFields';
import {
  NodeExecutionState,
  NodeExecutionStatus,
} from 'state-flow/common-types';
import { useFlowStore } from 'state-flow/flow-store';

import NodeRegularOutgoingConditionHandle from 'components/node-connector/condition/NodeRegularOutgoingConditionHandle';
import {
  VariableConfig,
  type VariableDefinition,
} from 'components/node-connector/types';
import NodeOutputVariableList from 'components/node-connector/variable/NodeOutputVariableList';
import NodeExecutionMessageDisplay from 'components/node-execution-state/NodeExecutionMessageDisplay';
import NodeBox from '../node-box/NodeBox';
import NodeBoxHeaderSection from '../node-box/NodeBoxHeaderSection';
import NodeBoxSection from '../node-box/NodeBoxSection';

export type SourceConnector = {
  id: string;
  name: string;
  value: unknown;
};

type Props = {
  // Node Definition Level
  // Node Level
  nodeId: string;
  isNodeReadOnly: boolean;
  nodeConfig: Exclude<
    NodeConfig,
    | InputNodeInstanceLevelConfig
    | OutputNodeInstanceLevelConfig
    | ConditionNodeInstanceLevelConfig
    | JavaScriptFunctionNodeInstanceLevelConfig
  >;
  inputVariables: NodeInputVariable[];
  outputVariables: NodeOutputVariable[];
  incomingCondition: IncomingCondition;
  // Node Level but not save to server
  nodeExecutionState: Option<NodeExecutionState>;
};

function DefaultNode(props: Props) {
  // ANCHOR: ReactFlow
  const updateNodeInternals = useUpdateNodeInternals();

  const addVariable = useFlowStore((s) => s.addConnector);

  // ANCHOR: Node Definition
  const nodeDefinition = useMemo(
    () => getNodeDefinitionForNodeTypeName(props.nodeConfig.type),
    [props.nodeConfig.type],
  );

  return (
    <>
      <NodeIncomingConditionHandle
        nodeId={props.nodeId}
        conditionId={props.incomingCondition.id}
      />
      <NodeRegularOutgoingConditionHandle nodeId={props.nodeId} />
      <NodeBox
        nodeType={props.nodeConfig.type}
        isRunning={
          props.nodeExecutionState?.status === NodeExecutionStatus.Executing
        }
        hasError={
          props.nodeExecutionState?.status === NodeExecutionStatus.Error
        }
      >
        <NodeBoxHeaderSection
          nodeClass={NodeClass.Process}
          title={nodeDefinition.label}
          showAddVariableButton={!!nodeDefinition.canUserAddIncomingVariables}
          nodeId={props.nodeId}
          isNodeReadOnly={props.isNodeReadOnly}
          onClickAddVariableButton={() => {
            addVariable(
              props.nodeId,
              ConnectorType.NodeInput,
              props.inputVariables.length,
            );
            updateNodeInternals(props.nodeId);
          }}
        />
        <GenericContainer>
          <NodeRenamableVariableList
            showConnectorHandle={Position.Left}
            nodeId={props.nodeId}
            isNodeReadOnly={props.isNodeReadOnly}
            variableConfigs={props.inputVariables.map<VariableConfig>(
              (variable) => {
                return {
                  id: variable.id,
                  name: variable.name,
                  isGlobal: variable.isGlobal,
                  globalVariableId: variable.globalVariableId,
                };
              },
            )}
            variableDefinitions={props.inputVariables.map<VariableDefinition>(
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
        <GenericContainer>
          {nodeDefinition.accountLevelConfigFieldDefinitions && (
            <NodeAccountLevelFields
              isNodeConfigReadOnly={props.isNodeReadOnly}
              accountLevelConfigFieldDefinitions={
                nodeDefinition.accountLevelConfigFieldDefinitions
              }
              nodeConfig={props.nodeConfig}
            />
          )}
          <NodeInstanceLevelFields
            isNodeConfigReadOnly={props.isNodeReadOnly}
            instanceLevelConfigFieldDefinitions={
              nodeDefinition.instanceLevelConfigFieldDefinitions
            }
            nodeConfig={props.nodeConfig}
          />
        </GenericContainer>
        <NodeBoxSection>
          <NodeOutputVariableList
            nodeId={props.nodeId}
            isNodeReadOnly={props.isNodeReadOnly}
            variables={props.outputVariables}
          />
        </NodeBoxSection>
        <NodeBoxSection>
          {props.nodeExecutionState?.messages.map((message, index) => (
            <NodeExecutionMessageDisplay key={index} message={message} />
          ))}
        </NodeBoxSection>
      </NodeBox>
    </>
  );
}

const GenericContainer = styled.div`
  padding: 0 10px;
`;

export default DefaultNode;
