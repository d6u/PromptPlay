import styled from '@emotion/styled';
import { Option } from '@mobily/ts-belt';
import { ReactNode, useMemo } from 'react';
import { Position, useUpdateNodeInternals } from 'reactflow';

import {
  ConditionNodeInstanceLevelConfig,
  ConditionTarget,
  ConnectorType,
  InputNodeInstanceLevelConfig,
  NodeConfig,
  NodeInputVariable,
  NodeOutputVariable,
  OutputNodeInstanceLevelConfig,
  getNodeDefinitionForNodeTypeName,
} from 'flow-models';

import NodeTargetConditionHandle from 'components/node-connector/NodeTargetConditionHandle';
import NodeVariableResultItem from 'components/node-connector/NodeVariableResultItem';
import NodeVariablesEditableList from 'components/node-connector/NodeVariablesEditableList';
import NodeAccountLevelFields from 'components/node-fields/NodeAccountLevelFields';
import NodeInstanceLevelFields from 'components/node-fields/NodeInstanceLevelFields';
import { useFlowStore } from 'state-flow/flow-store';
import { NodeMetadata } from 'state-flow/types';

import NodeBox from './NodeBox';
import NodeBoxHeaderSection from './NodeBoxHeaderSection';
import NodeBoxSection from './NodeBoxSection';

export type SrcConnector = {
  id: string;
  name: string;
  value: unknown;
};

type Props = {
  // Node Definition Level
  // Node Level
  nodeId: string;
  isNodeConfigReadOnly: boolean;
  // In this component, we assume nodeConfig is not null.
  //
  // When deleting a node, there is a small delay between
  // deleting the nodeConfig and unmounting the node component,
  // which could cause errors due to nodeConfig being null.
  //
  // Thus, we pass nodeConfig through props to ensure it is not null.
  nodeConfig: Exclude<
    NodeConfig,
    | InputNodeInstanceLevelConfig
    | OutputNodeInstanceLevelConfig
    | ConditionNodeInstanceLevelConfig
  >;
  inputVariables: NodeInputVariable[];
  outputVariables: NodeOutputVariable[];
  conditionTarget: ConditionTarget;
  // Node Level but not save to server
  nodeMetadata: Option<NodeMetadata>;
  // UI Level
  children?: ReactNode;
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

  const srcConnectors = useMemo(() => {
    return props.outputVariables.map<SrcConnector>((output) => {
      return {
        id: output.id,
        name: output.name,
        value: defaultVariableValueMap[output.id],
      };
    });
  }, [props.outputVariables, defaultVariableValueMap]);

  // ANCHOR: Variable Operations

  let children: ReactNode;
  if (props.children) {
    children = props.children;
  } else {
    children = (
      <GenericContainer>
        {nodeDefinition.accountLevelConfigFieldDefinitions && (
          <NodeAccountLevelFields
            isNodeConfigReadOnly={props.isNodeConfigReadOnly}
            accountLevelConfigFieldDefinitions={
              nodeDefinition.accountLevelConfigFieldDefinitions
            }
            nodeConfig={props.nodeConfig}
          />
        )}
        <NodeInstanceLevelFields
          isNodeConfigReadOnly={props.isNodeConfigReadOnly}
          instanceLevelConfigFieldDefinitions={
            nodeDefinition.instanceLevelConfigFieldDefinitions
          }
          nodeConfig={props.nodeConfig}
        />
      </GenericContainer>
    );
  }

  return (
    <>
      <NodeTargetConditionHandle
        nodeId={props.nodeId}
        conditionId={props.conditionTarget.id}
      />
      <NodeBox
        nodeType={props.nodeConfig.type}
        isRunning={props.nodeMetadata?.isRunning}
        hasError={props.nodeMetadata?.hasError}
      >
        <NodeBoxHeaderSection
          title={nodeDefinition.label}
          showAddVariableButton={!!nodeDefinition.canUserAddIncomingVariables}
          nodeId={props.nodeId}
          isNodeReadOnly={props.isNodeConfigReadOnly}
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
            isNodeReadOnly={props.isNodeConfigReadOnly}
            variableConfigs={props.inputVariables.map((variable) => {
              const incomingVariableConfig =
                nodeDefinition.fixedIncomingVariables?.[variable.name];

              return {
                id: variable.id,
                name: variable.name,
                isReadOnly: incomingVariableConfig != null,
                helperMessage: incomingVariableConfig?.helperMessage,
              };
            })}
          />
        </GenericContainer>
        {children}
        <NodeBoxSection>
          {srcConnectors.map((connector) => (
            <NodeVariableResultItem
              key={connector.id}
              variableId={connector.id}
              variableName={connector.name}
              variableValue={connector.value}
              nodeId={props.nodeId}
            />
          ))}
        </NodeBoxSection>
      </NodeBox>
    </>
  );
}

const GenericContainer = styled.div`
  padding-left: 10px;
  padding-right: 10px;
`;

export default DefaultNode;
