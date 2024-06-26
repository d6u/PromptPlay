import styled from '@emotion/styled';
import { Option } from '@mobily/ts-belt';
import { useMemo } from 'react';
import { Position, useUpdateNodeInternals } from 'reactflow';

import {
  ConnectorType,
  IncomingCondition,
  InputNodeInstanceLevelConfig,
  JavaScriptFunctionNodeInstanceLevelConfig,
  NodeConfig,
  NodeInputVariable,
  NodeKind,
  NodeOutputVariable,
  OutputNodeInstanceLevelConfig,
  getNodeDefinitionForNodeTypeName,
  type JSONataConditionNodeInstanceLevelConfig,
} from 'flow-models';
import { NodeRunState } from 'run-flow';

import NodeIncomingConditionHandle from 'components/node-connector/condition/NodeIncomingConditionHandle';
import NodeRegularOutgoingConditionHandle from 'components/node-connector/condition/NodeRegularOutgoingConditionHandle';
import NodeOutputVariableList from 'components/node-connector/variable/NodeOutputVariableList';
import NodeRenamableVariableList from 'components/node-connector/variable/NodeRenamableVariableList';
import NodeExecutionMessageDisplay from 'components/node-execution-state/NodeExecutionMessageDisplay';
import NodeInstanceLevelFields from 'components/node-fields/NodeInstanceLevelFields';
import { NodeRunStateData } from 'state-flow/common-types';
import { useFlowStore } from 'state-flow/flow-store';

import NodeBox from '../node-box/NodeBox';
import NodeBoxHeaderSection from '../node-box/NodeBoxHeaderSection';
import NodeBoxSection from '../node-box/NodeBoxSection';

export type SourceConnector = {
  id: string;
  name: string;
  value: unknown;
};

type Props = {
  // reactflow props
  selected: boolean;
  // custom props
  // Node Definition Level
  // Node Level
  nodeId: string;
  isNodeReadOnly: boolean;
  nodeConfig: Exclude<
    NodeConfig,
    | InputNodeInstanceLevelConfig
    | OutputNodeInstanceLevelConfig
    | JSONataConditionNodeInstanceLevelConfig
    | JavaScriptFunctionNodeInstanceLevelConfig
  >;
  inputVariables: NodeInputVariable[];
  outputVariables: NodeOutputVariable[];
  incomingCondition: IncomingCondition;
  // Node Level but not save to server
  nodeExecutionState: Option<NodeRunStateData>;
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

  const nodeState = useFlowStore(
    (s) =>
      s.getFlowContent().runFlowStates.nodeStates[props.nodeId] ??
      NodeRunState.PENDING,
  );

  return (
    <>
      <NodeIncomingConditionHandle
        nodeId={props.nodeId}
        conditionId={props.incomingCondition.id}
      />
      <NodeRegularOutgoingConditionHandle nodeId={props.nodeId} />
      <NodeBox selected={props.selected} nodeState={nodeState}>
        <NodeBoxHeaderSection
          nodeKind={NodeKind.Process}
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
          />
        </GenericContainer>
        <GenericContainer>
          <NodeInstanceLevelFields
            isNodeConfigReadOnly={props.isNodeReadOnly}
            nodeConfigFieldDefs={nodeDefinition.configFields}
            nodeConfig={props.nodeConfig}
            isNodeInspectorPane={false}
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
