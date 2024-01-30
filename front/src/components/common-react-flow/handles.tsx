import styled from '@emotion/styled';
import { Position } from 'reactflow';
import { BaseHandle, HANDLE_WIDTH } from './handles/common';
import { BACKDROP_PADDING } from './ui-constants';

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
      position={Position.Left}
      type="target"
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
