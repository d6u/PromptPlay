import { Position } from 'reactflow';

import { BACKDROP_PADDING } from 'view-flow-canvas/constants';

import { useFlowStore } from 'state-flow/flow-store';
import { EdgeConnectStartConnectorClass } from 'state-flow/types';
import {
  BaseConditionHandle,
  HANDLE_HEIGHT,
  HANDLE_WIDTH,
} from '../base-connector-handles';

type Props = {
  conditionId: string;
  nodeId: string;
};

function NodeTargetConditionHandle(props: Props) {
  const paramsOnUserStartConnectingEdge = useFlowStore(
    (s) => s.paramsOnUserStartConnectingEdge,
  );

  let grayOutHandle = false;

  if (paramsOnUserStartConnectingEdge) {
    const { nodeId, handleId, handleType, connectorClass } =
      paramsOnUserStartConnectingEdge;

    const isThisTheStartHandle = handleId === props.conditionId;
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
    <BaseConditionHandle
      id={props.conditionId}
      type="target"
      position={Position.Left}
      style={{
        top: 12 + HANDLE_HEIGHT / 2,
        left: -(HANDLE_WIDTH / 2 - BACKDROP_PADDING / 2),
        background: grayOutHandle ? '#c2c2c2' : undefined,
        cursor: grayOutHandle ? 'not-allowed' : undefined,
      }}
    />
  );
}

export default NodeTargetConditionHandle;
