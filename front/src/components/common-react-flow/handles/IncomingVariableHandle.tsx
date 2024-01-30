import styled from '@emotion/styled';
import { ComponentProps } from 'react';
import { Position } from 'reactflow';
import { BACKDROP_PADDING } from '../ui-constants';
import { BaseHandle, HANDLE_WIDTH } from './common';

const IncomingConnectorHandleImpl = styled(BaseHandle)`
  background: #00b3ff;
  left: -${HANDLE_WIDTH / 2 - BACKDROP_PADDING / 2}px;
`;

export default function IncomingVariableHandle(
  props: Omit<
    ComponentProps<typeof IncomingConnectorHandleImpl>,
    'position' | 'type'
  >,
) {
  return (
    <IncomingConnectorHandleImpl
      {...props}
      position={Position.Left}
      type="target"
    />
  );
}
