import styled from '@emotion/styled';
import { ComponentProps } from 'react';
import { Position } from 'reactflow';

import { ROW_MARGIN_TOP } from 'components/node-variables-editable-list/NodeVariableEditableItem';

import {
  BACKDROP_PADDING,
  CONDITION_NODE_DEFAULT_CASE_HELPER_TEXT_HEIGHT,
  SECTION_PADDING_BOTTOM,
} from '../constants';
import { VARIABLE_LABEL_HEIGHT } from '../node-box/NodeBoxOutgoingVariableBlock';
import { BaseHandle, HANDLE_HEIGHT, HANDLE_WIDTH } from './common';

const OutgoingConditionHandleImpl = styled(BaseHandle)`
  background: #7a00df;
  top: unset;
  right: -${HANDLE_WIDTH / 2 - BACKDROP_PADDING / 2}px;
`;

export default function OutgoingConditionHandle(
  props: Omit<
    ComponentProps<typeof OutgoingConditionHandleImpl>,
    'position' | 'type'
  > & {
    index?: number;
    totalConditionCount?: number;
    isDefaultCase?: boolean;
  },
) {
  const {
    index = 0,
    totalConditionCount = 1,
    isDefaultCase = false,
    ...restProps
  } = props;

  return (
    <OutgoingConditionHandleImpl
      {...restProps}
      position={Position.Right}
      type="source"
      style={{
        ...props.style,
        bottom: calcBottom(index, totalConditionCount, isDefaultCase),
      }}
    />
  );
}

function calcBottom(
  index: number,
  totalConditionCount: number,
  isDefaultCase: boolean,
) {
  const footerSectionHeight =
    ROW_MARGIN_TOP +
    CONDITION_NODE_DEFAULT_CASE_HELPER_TEXT_HEIGHT +
    SECTION_PADDING_BOTTOM +
    BACKDROP_PADDING;

  const center = VARIABLE_LABEL_HEIGHT / 2 - HANDLE_HEIGHT / 2;

  if (isDefaultCase) {
    return footerSectionHeight + center;
  }

  return (
    footerSectionHeight +
    center +
    (totalConditionCount - 1 - index) *
      (SECTION_PADDING_BOTTOM + ROW_MARGIN_TOP + VARIABLE_LABEL_HEIGHT * 2)
  );
}
