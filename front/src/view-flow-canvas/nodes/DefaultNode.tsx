import styled from '@emotion/styled';
import { Option } from '@mobily/ts-belt';
import { useMemo } from 'react';
import { Position, useUpdateNodeInternals } from 'reactflow';

import {
  ConditionNodeInstanceLevelConfig,
  ConditionTarget,
  ConnectorType,
  InputNodeInstanceLevelConfig,
  JavaScriptFunctionNodeInstanceLevelConfig,
  NodeConfig,
  NodeInputVariable,
  NodeOutputVariable,
  OutputNodeInstanceLevelConfig,
  getNodeDefinitionForNodeTypeName,
} from 'flow-models';

import NodeTargetConditionHandle from 'components/node-connector/condition/NodeTargetConditionHandle';
import NodeVariableResultItem from 'components/node-connector/variable/NodeVariableResultItem';
import NodeVariablesEditableList from 'components/node-connector/variable/NodeVariablesEditableList';
import NodeAccountLevelFields from 'components/node-fields/NodeAccountLevelFields';
import NodeInstanceLevelFields from 'components/node-fields/NodeInstanceLevelFields';
import { useFlowStore } from 'state-flow/flow-store';
import { NodeExecutionState, NodeExecutionStatus } from 'state-flow/types';

import { VariableConfig } from 'components/node-connector/types';
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
  conditionTarget: ConditionTarget;
  // Node Level but not save to server
  nodeExecutionState: Option<NodeExecutionState>;
};

function DefaultNode(props: Props) {
  // ANCHOR: ReactFlow
  const updateNodeInternals = useUpdateNodeInternals();

  const addVariable = useFlowStore((s) => s.addVariable);

  // ANCHOR: Node Definition
  const nodeDefinition = useMemo(
    () => getNodeDefinitionForNodeTypeName(props.nodeConfig.type),
    [props.nodeConfig.type],
  );

  // ANCHOR: Store Data
  const defaultVariableValueMap = useFlowStore((s) =>
    s.getDefaultVariableValueLookUpDict(),
  );

  const sourceConnectors = useMemo(() => {
    return props.outputVariables.map<SourceConnector>((output) => {
      return {
        id: output.id,
        name: output.name,
        value: defaultVariableValueMap[output.id],
      };
    });
  }, [props.outputVariables, defaultVariableValueMap]);

  return (
    <>
      <NodeTargetConditionHandle
        nodeId={props.nodeId}
        conditionId={props.conditionTarget.id}
      />
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
          <NodeVariablesEditableList
            showConnectorHandle={Position.Left}
            nodeId={props.nodeId}
            isNodeReadOnly={props.isNodeReadOnly}
            variableConfigs={props.inputVariables.map<VariableConfig>(
              (variable) => {
                const incomingVariableConfig =
                  nodeDefinition.fixedIncomingVariables?.[variable.name];

                return {
                  id: variable.id,
                  name: variable.name,
                  isGlobal: variable.isGlobal,
                  globalVariableId: variable.globalVariableId,
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
          {sourceConnectors.map((connector) => (
            <NodeVariableResultItem
              key={connector.id}
              variableId={connector.id}
              variableName={connector.name}
              variableValue={connector.value}
              nodeId={props.nodeId}
            />
          ))}
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
