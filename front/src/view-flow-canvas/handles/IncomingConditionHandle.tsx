import styled from '@emotion/styled';
import { ComponentProps } from 'react';
import { Position } from 'reactflow';
import BaseFlowHandle, {
  HANDLE_WIDTH,
} from '../../components/node-variables-editable-list/BaseFlowHandle';
import { BACKDROP_PADDING } from '../constants';

const IncomingConditionHandleImpl = styled(BaseFlowHandle)`
  background: #7a00df;
  top: 12px;
  left: -${HANDLE_WIDTH / 2 - BACKDROP_PADDING / 2}px;
`;

export default function IncomingConditionHandle(
  props: Omit<
    ComponentProps<typeof IncomingConditionHandleImpl>,
    'position' | 'type'
  >,
) {
  return (
    <IncomingConditionHandleImpl
      {...props}
      position={Position.Left}
      type="target"
      // TODO: Hide and show this handle based on the connect start handle type.
      //
      // NOTE: Because we are using @emotion/styled, it doesn't seem to support
      // transient props that styled-components supports. Thus, we use style
      // prop instead.
      // https://styled-components.com/docs/api#transient-props
    />
  );
}
