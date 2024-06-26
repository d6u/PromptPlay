import styled from '@emotion/styled';
import { useMemo } from 'react';
import { Position, useUpdateNodeInternals } from 'reactflow';

import {
  ConnectorType,
  IncomingCondition,
  NodeKind,
  OutputNodeAllLevelConfig,
  getNodeDefinitionForNodeTypeName,
  type GenericChatbotFinishNodeAllLevelConfig,
} from 'flow-models';
import { NodeRunState } from 'run-flow';

import NodeIncomingConditionHandle from 'components/node-connector/condition/NodeIncomingConditionHandle';
import NodeRenamableVariableList from 'components/node-connector/variable/NodeRenamableVariableList';
import { useFlowStore } from 'state-flow/flow-store';
import { selectVariables } from 'state-flow/util/state-utils';

import NodeBox from '../node-box/NodeBox';
import NodeBoxHeaderSection from '../node-box/NodeBoxHeaderSection';

type Props = {
  // reactflow props
  selected: boolean;
  // custom props
  nodeId: string;
  isNodeReadOnly: boolean;
  nodeConfig: OutputNodeAllLevelConfig | GenericChatbotFinishNodeAllLevelConfig;
  incomingCondition: IncomingCondition;
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
    return selectVariables(
      props.nodeConfig,
      ConnectorType.NodeInput,
      connectors,
    );
  }, [props.nodeConfig, connectors]);

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
      <NodeBox selected={props.selected} nodeState={nodeState}>
        <NodeBoxHeaderSection
          nodeKind={NodeKind.Finish}
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
