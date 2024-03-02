import styled from '@emotion/styled';
import { ComponentProps } from 'react';
import { Position } from 'reactflow';

import { ROW_MARGIN_TOP } from 'components/node-connector/NodeVariableEditableItem';
import {
  BaseConnectorHandle,
  HANDLE_HEIGHT,
  HANDLE_WIDTH,
} from 'components/node-connector/base-connector-handles';
import { CONNECTOR_RESULT_DISPLAY_HEIGHT } from 'components/node-connector/constants';

import {
  BACKDROP_PADDING,
  CONDITION_NODE_DEFAULT_CASE_HELPER_TEXT_HEIGHT,
  SECTION_PADDING_BOTTOM,
} from '../constants';

const OutgoingConditionHandleImpl = styled(BaseConnectorHandle)`
  background: #7a00df;
  top: unset;
  right: -${HANDLE_WIDTH / 2 - BACKDROP_PADDING / 2}px;
  transform: none;
`;

function OutgoingConditionHandle(
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

  const center = CONNECTOR_RESULT_DISPLAY_HEIGHT / 2 - HANDLE_HEIGHT / 2;

  if (isDefaultCase) {
    return footerSectionHeight + center;
  }

  return (
    footerSectionHeight +
    center +
    (totalConditionCount - 1 - index) *
      (SECTION_PADDING_BOTTOM +
        ROW_MARGIN_TOP +
        CONNECTOR_RESULT_DISPLAY_HEIGHT * 2)
  );
}

export default OutgoingConditionHandle;
