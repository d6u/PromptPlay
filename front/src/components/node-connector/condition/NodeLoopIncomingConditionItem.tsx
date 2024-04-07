import styled from '@emotion/styled';
import { Position } from 'reactflow';

import type { ConditionTarget } from 'flow-models';

import { useFlowStore } from 'state-flow/flow-store';

import { EdgeConnectStartConnectorClass } from 'state-flow/common-types';
import { BaseConditionHandle } from '../base-connector-handles';

type Props = {
  nodeId: string;
  condition: ConditionTarget;
};

function NodeLoopIncomingConditionItem(props: Props) {
  const paramsOnUserStartConnectingEdge = useFlowStore(
    (s) => s.paramsOnUserStartConnectingEdge,
  );

  let labelText;
  switch (props.condition.index) {
    case 0:
      labelText = 'Entry';
      break;
    case 1:
      labelText = 'Repeat';
      break;
    case 2:
      labelText = 'Exit';
      break;
  }

  let grayOutHandle = false;

  if (paramsOnUserStartConnectingEdge) {
    const { nodeId, handleId, handleType, connectorClass } =
      paramsOnUserStartConnectingEdge;

    const isThisTheStartHandle = handleId === props.condition.id;
    const isThisOnTheSameNode = nodeId === props.nodeId;
    const isThisInTheSameConnectorClass =
      connectorClass === EdgeConnectStartConnectorClass.Condition;
    const isThisTheSameHandleType = handleType === 'target';

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
        type="target"
        position={Position.Left}
        style={{
          left: -19,
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
`;

export default NodeLoopIncomingConditionItem;
