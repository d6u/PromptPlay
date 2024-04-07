import styled from '@emotion/styled';
import { useMemo } from 'react';
import invariant from 'tiny-invariant';

import {
  ConnectorType,
  NodeClass,
  NodeType,
  getNodeDefinitionForNodeTypeName,
  type Condition,
  type ConditionTarget,
  type LoopNodeAllLevelConfig,
} from 'flow-models';

import NodeLoopIncomingConditionItem from 'components/node-connector/condition/NodeLoopIncomingConditionItem';
import NodeLoopOutgoingConditionItem from 'components/node-connector/condition/NodeLoopOutgoingConditionItem';
import { useFlowStore } from 'state-flow/flow-store';

import NodeBox from '../node-box/NodeBox';
import NodeBoxHeaderSection from '../node-box/NodeBoxHeaderSection';

type Props = {
  nodeId: string;
  isNodeReadOnly: boolean;
  nodeConfig: LoopNodeAllLevelConfig;
};

function LoopNode(props: Props) {
  const nodeDefinition = useMemo(
    () => getNodeDefinitionForNodeTypeName(props.nodeConfig.type),
    [props.nodeConfig.type],
  );

  const connectors = useFlowStore((s) => s.getFlowContent().connectors);

  const incomingConditions = useMemo(() => {
    return Object.values(connectors)
      .filter(
        (c): c is ConditionTarget =>
          c.nodeId === props.nodeId && c.type === ConnectorType.ConditionTarget,
      )
      .sort((a, b) => a.index! - b.index!);
  }, [props.nodeId, connectors]);

  const outgoingCondition = useMemo(() => {
    return Object.values(connectors).find(
      (c): c is Condition =>
        c.nodeId === props.nodeId && c.type === ConnectorType.Condition,
    );
  }, [props.nodeId, connectors]);

  invariant(
    outgoingCondition != null,
    'Outgoing condition should not be null.',
  );

  return (
    <>
      <NodeBox nodeType={NodeType.LoopNode}>
        <NodeBoxHeaderSection
          nodeClass={NodeClass.Finish}
          isNodeReadOnly={props.isNodeReadOnly}
          title={nodeDefinition.label}
          nodeId={props.nodeId}
          showAddVariableButton={!!nodeDefinition.canUserAddIncomingVariables}
          onClickAddVariableButton={() => {}}
        />
        <GenericContainer>
          {incomingConditions.map((condition) => (
            <NodeLoopIncomingConditionItem
              key={condition.id}
              nodeId={props.nodeId}
              condition={condition}
            />
          ))}
          <NodeLoopOutgoingConditionItem
            nodeId={props.nodeId}
            condition={outgoingCondition}
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

export default LoopNode;
