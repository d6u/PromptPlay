import styled from '@emotion/styled';
import { useMemo } from 'react';

import {
  NodeClass,
  getNodeDefinitionForNodeTypeName,
  type LoopFinishNodeAllLevelConfig,
} from 'flow-models';

import NodeIncomingConditionItem from 'components/node-connector/condition/NodeIncomingConditionItem';
import { useFlowStore } from 'state-flow/flow-store';
import { selectIncomingConditions } from 'state-flow/util/state-utils';

import { NodeRunState } from 'run-flow';
import NodeBox from '../node-box/NodeBox';
import NodeBoxHeaderSection from '../node-box/NodeBoxHeaderSection';

type Props = {
  // reactflow props
  selected: boolean;
  // custom props
  isNodeReadOnly: boolean;
  nodeId: string;
  nodeConfig: LoopFinishNodeAllLevelConfig;
};

function LoopFinishNode(props: Props) {
  const nodeDefinition = useMemo(
    () => getNodeDefinitionForNodeTypeName(props.nodeConfig.type),
    [props.nodeConfig.type],
  );

  const connectors = useFlowStore((s) => s.getFlowContent().connectors);

  const incomingConditions = useMemo(() => {
    return selectIncomingConditions(props.nodeId, connectors);
  }, [props.nodeId, connectors]);

  const nodeState = useFlowStore(
    (s) =>
      s.getFlowContent().runFlowStates.nodeStates[props.nodeId] ??
      NodeRunState.PENDING,
  );

  return (
    <>
      <NodeBox selected={props.selected} nodeState={nodeState}>
        <NodeBoxHeaderSection
          nodeClass={NodeClass.Finish}
          isNodeReadOnly={props.isNodeReadOnly}
          title={nodeDefinition.label}
          nodeId={props.nodeId}
          showAddVariableButton={!!nodeDefinition.canUserAddIncomingVariables}
          onClickAddVariableButton={() => {}}
        />
        <GenericContainer>
          {incomingConditions.map((condition) => {
            return (
              <NodeIncomingConditionItem
                key={condition.id}
                nodeId={props.nodeId}
                condition={condition}
                label={condition.index === 0 ? 'continue' : 'break'}
              />
            );
          })}
        </GenericContainer>
      </NodeBox>
    </>
  );
}

const GenericContainer = styled.div`
  padding-left: 10px;
  padding-right: 10px;
`;

export default LoopFinishNode;
