import styled from '@emotion/styled';
import { Handle, Position } from 'reactflow';
import { BACKDROP_PADDING } from './ui-constants';

export const HANDLE_WIDTH = 15;
export const HANDLE_HEIGHT = 34;

const BaseHandle = styled(Handle)`
  width: ${HANDLE_WIDTH}px;
  height: ${HANDLE_HEIGHT}px;
  border-radius: ${HANDLE_WIDTH / 2}px;
  transform: none;
`;

export const IncomingConnectorHandle = styled(BaseHandle)`
  background: #00b3ff;
  left: -${HANDLE_WIDTH / 2 - BACKDROP_PADDING / 2}px;
`;

export const OutgoingConnectorHandle = styled(BaseHandle)`
  background: #00b3ff;
  top: unset;
  right: -${HANDLE_WIDTH / 2 - BACKDROP_PADDING / 2}px;
`;

export const OutgoingConditionHandle = styled(BaseHandle)`
  background: #7a00df;
  top: unset;
  right: -${HANDLE_WIDTH / 2 - BACKDROP_PADDING / 2}px;
`;

const IncomingConditionHandleImpl = styled(BaseHandle)`
  background: #7a00df;
  top: 12px;
  left: -${HANDLE_WIDTH / 2 - BACKDROP_PADDING / 2}px;
`;

type ConditionTargetHandleProps = {
  connectorId: string;
};

export function ConditionTargetHandle(props: ConditionTargetHandleProps) {
  return (
    <IncomingConditionHandleImpl
      type="target"
      position={Position.Left}
      id={props.connectorId}
      // TODO: Hide and show this handle based on the connect start handle type.
      //
      // NOTE: Because we are using @emotion/styled, it doesn't seem to support
      // transient props that styled-components supports. Thus, we use style
      // prop instead.
      // https://styled-components.com/docs/api#transient-props
      style={{ visibility: 'visible' }}
    />
  );
}
