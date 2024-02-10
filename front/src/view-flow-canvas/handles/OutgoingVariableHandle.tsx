import styled from '@emotion/styled';
import { ComponentProps } from 'react';
import { Position } from 'reactflow';

import { ROW_MARGIN_TOP } from 'components/node-variables-editable-list/NodeVariableEditableItem';
import { CONNECTOR_RESULT_DISPLAY_HEIGHT } from 'components/node-variables-editable-list/constants';

import { BACKDROP_PADDING, SECTION_PADDING_BOTTOM } from '../constants';
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

  const center = CONNECTOR_RESULT_DISPLAY_HEIGHT / 2 - HANDLE_HEIGHT / 2;

  return (
    footerSectionHeight +
    center +
    (totalVariableCount - 1 - index) *
      (ROW_MARGIN_TOP + CONNECTOR_RESULT_DISPLAY_HEIGHT)
  );
}
