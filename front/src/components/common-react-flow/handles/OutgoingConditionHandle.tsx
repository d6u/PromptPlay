import styled from '@emotion/styled';
import { ComponentProps } from 'react';
import { Position } from 'reactflow';
import { BACKDROP_PADDING } from '../ui-constants';
import { BaseHandle, HANDLE_WIDTH } from './common';

const OutgoingConditionHandleImpl = styled(BaseHandle)`
  background: #7a00df;
  top: unset;
  right: -${HANDLE_WIDTH / 2 - BACKDROP_PADDING / 2}px;
`;

export default function OutgoingConditionHandle(
  props: Omit<
    ComponentProps<typeof OutgoingConditionHandleImpl>,
    'position' | 'type'
  >,
) {
  return (
    <OutgoingConditionHandleImpl
      {...props}
      position={Position.Right}
      type="source"
    />
  );
}
