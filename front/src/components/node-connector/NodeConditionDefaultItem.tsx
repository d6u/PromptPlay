import styled from '@emotion/styled';
import { Option } from '@mobily/ts-belt';
import { Position } from 'reactflow';

import { useFlowStore } from 'state-flow/flow-store';
import { EdgeConnectStartConnectorClass } from 'state-flow/types';

import NodeConnectorResultDisplay from './NodeConnectorResultDisplay';
import { BaseConditionHandle } from './base-connector-handles';

type Props = {
  showHandle?: boolean;
  nodeId: string;
  conditionId: string;
  conditionValue: Option<boolean>;
};

function NodeConditionDefaultItem(props: Props) {
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
    const isThisTheSameHandleType = handleType === 'source';

    grayOutHandle =
      !isThisTheStartHandle &&
      (isThisOnTheSameNode ||
        !isThisInTheSameConnectorClass ||
        isThisTheSameHandleType);
  }

  return (
    <Container>
      {props.showHandle && (
        <BaseConditionHandle
          id={props.conditionId}
          type="source"
          position={Position.Right}
          style={{
            right: -19,
            background: grayOutHandle ? '#c2c2c2' : undefined,
            cursor: grayOutHandle ? 'not-allowed' : undefined,
          }}
        />
      )}
      <NodeConnectorResultDisplay
        label="Default case"
        value={props.conditionValue}
      />
    </Container>
  );
}

const Container = styled.div`
  position: relative;
`;

export default NodeConditionDefaultItem;
