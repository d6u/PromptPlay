import styled from '@emotion/styled';
import { ComponentProps } from 'react';
import { Position } from 'reactflow';
import { ROW_MARGIN_TOP } from '../../route-canvas/flow-canvas/nodes/node-common/NodeInputModifyRow';
import { VARIABLE_LABEL_HEIGHT } from '../../route-canvas/flow-canvas/nodes/node-common/NodeOutputRow';
import { SECTION_PADDING_BOTTOM } from '../../route-canvas/flow-canvas/nodes/node-common/node-common';
import { BACKDROP_PADDING } from '../ui-constants';
import { BaseHandle, HANDLE_HEIGHT, HANDLE_WIDTH } from './common';

const OutgoingVariableHandleImpl = styled(BaseHandle)`
  background: #00b3ff;
  top: unset;
  right: -${HANDLE_WIDTH / 2 - BACKDROP_PADDING / 2}px;
`;

export default function OutgoingVariableHandle(
  props: Omit<
    ComponentProps<typeof OutgoingVariableHandleImpl>,
    'position' | 'type'
  > & {
    index?: number;
    totalVariableCount?: number;
  },
) {
  const { index = 0, totalVariableCount = 1, ...restProps } = props;

  return (
    <OutgoingVariableHandleImpl
      {...restProps}
      position={Position.Right}
      type="source"
      style={{
        ...props.style,
        bottom: calcBottom(index, totalVariableCount),
      }}
    />
  );
}

function calcBottom(index: number, totalVariableCount: number) {
  const footerSectionHeight = BACKDROP_PADDING + SECTION_PADDING_BOTTOM;

  const center = VARIABLE_LABEL_HEIGHT / 2 - HANDLE_HEIGHT / 2;

  return (
    footerSectionHeight +
    center +
    (totalVariableCount - 1 - index) * (ROW_MARGIN_TOP + VARIABLE_LABEL_HEIGHT)
  );
}
