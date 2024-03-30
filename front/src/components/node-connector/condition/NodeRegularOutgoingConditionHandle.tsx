import { useMemo } from 'react';
import { Position } from 'reactflow';

import { EdgeConnectStartConnectorClass } from 'state-flow/common-types';
import { useFlowStore } from 'state-flow/flow-store';
import { selectRegularOutgoingCondition } from 'state-flow/util/state-utils';
import { BACKDROP_PADDING } from 'view-flow-canvas/constants';

import {
  BaseConditionHandle,
  HANDLE_HEIGHT,
  HANDLE_WIDTH,
} from '../base-connector-handles';

type Props = {
  nodeId: string;
};

function NodeRegularOutgoingConditionHandle(props: Props) {
  const connectors = useFlowStore((s) => s.getFlowContent().variablesDict);

  const outgoingCondition = useMemo(() => {
    return selectRegularOutgoingCondition(props.nodeId, connectors);
  }, [props.nodeId, connectors]);

  const paramsOnUserStartConnectingEdge = useFlowStore(
    (s) => s.paramsOnUserStartConnectingEdge,
  );

  let grayOutHandle = false;

  if (paramsOnUserStartConnectingEdge) {
    const { nodeId, handleId, handleType, connectorClass } =
      paramsOnUserStartConnectingEdge;

    const isThisTheStartHandle = handleId === outgoingCondition.id;
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
    <BaseConditionHandle
      id={outgoingCondition.id}
      type="source"
      position={Position.Right}
      style={{
        top: 12 + HANDLE_HEIGHT / 2,
        right: -(HANDLE_WIDTH / 2 - BACKDROP_PADDING / 2),
        background: grayOutHandle ? '#c2c2c2' : undefined,
        cursor: grayOutHandle ? 'not-allowed' : undefined,
      }}
    />
  );
}

export default NodeRegularOutgoingConditionHandle;
