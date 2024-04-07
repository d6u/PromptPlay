import styled from '@emotion/styled';
import { Position } from 'reactflow';

import type { Condition } from 'flow-models';

import { useFlowStore } from 'state-flow/flow-store';

import { EdgeConnectStartConnectorClass } from 'state-flow/common-types';
import { BaseConditionHandle } from '../base-connector-handles';

type Props = {
  nodeId: string;
  condition: Condition;
};

function NodeLoopOutgoingConditionItem(props: Props) {
  let labelText;
  switch (props.condition.index) {
    case 0:
      labelText = 'Break Loop';
      break;
    case 1:
      labelText = 'Continue Loop';
      break;
  }

  const paramsOnUserStartConnectingEdge = useFlowStore(
    (s) => s.paramsOnUserStartConnectingEdge,
  );

  let grayOutHandle = false;

  if (paramsOnUserStartConnectingEdge) {
    const { nodeId, handleId, handleType, connectorClass } =
      paramsOnUserStartConnectingEdge;

    const isThisTheStartHandle = handleId === props.condition.id;
    const isThisOnTheSameNode = nodeId === props.nodeId;
    const isThisInTheSameConnectorClass =
      connectorClass === EdgeConnectStartConnectorClass.Condition;
    const isThisTheSameHandleType = handleType === 'source';

    grayOutHandle =
      !isThisTheStartHandle &&
      (isThisOnTheSameNode ||
        !isThisInTheSameConnectorClass ||
        isThisTheSameHandleType);
  }

  return (
    <Container key={props.condition.id}>
      <BaseConditionHandle
        id={props.condition.id}
        type="source"
        position={Position.Right}
        style={{
          right: -19,
          background: grayOutHandle ? '#c2c2c2' : undefined,
          cursor: grayOutHandle ? 'not-allowed' : undefined,
        }}
      />
      <Label>{labelText}</Label>
    </Container>
  );
}

const Container = styled.div`
  position: relative;
  margin-bottom: 10px;
  margin-top: 10px;
`;

const Label = styled.div`
  height: 32px;
  line-height: 32px;
  text-align: right;
`;

export default NodeLoopOutgoingConditionItem;
