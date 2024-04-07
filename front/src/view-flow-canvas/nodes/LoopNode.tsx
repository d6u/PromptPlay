import styled from '@emotion/styled';
import { useMemo } from 'react';

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

  const outgoingConditions = useMemo(() => {
    return Object.values(connectors)
      .filter(
        (c): c is Condition =>
          c.nodeId === props.nodeId && c.type === ConnectorType.Condition,
      )
      .sort((a, b) => a.index - b.index);
  }, [props.nodeId, connectors]);

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
          {outgoingConditions.map((condition) => (
            <NodeLoopOutgoingConditionItem
              key={condition.id}
              nodeId={props.nodeId}
              condition={condition}
            />
          ))}
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
