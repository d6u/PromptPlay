import styled from '@emotion/styled';
import { ComponentProps } from 'react';
import { Position } from 'reactflow';
import { BACKDROP_PADDING } from '../ui-constants';
import { BaseHandle, HANDLE_WIDTH } from './common';

const OutgoingVariableHandleImpl = styled(BaseHandle)`
  background: #00b3ff;
  top: unset;
  right: -${HANDLE_WIDTH / 2 - BACKDROP_PADDING / 2}px;
`;

export default function OutgoingVariableHandle(
  props: Omit<
    ComponentProps<typeof OutgoingVariableHandleImpl>,
    'position' | 'type'
  >,
) {
  return (
    <OutgoingVariableHandleImpl
      {...props}
      position={Position.Right}
      type="source"
    />
  );
}
