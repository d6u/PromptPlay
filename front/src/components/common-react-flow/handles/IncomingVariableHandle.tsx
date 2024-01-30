import styled from '@emotion/styled';
import { ComponentProps } from 'react';
import { Position } from 'reactflow';
import { VARIABLE_LABEL_HEIGHT } from '../../route-canvas/flow-canvas/nodes/node-common/NodeOutputRow';
import {
  ADD_VARIABLE_BUTTON_HEIGHT,
  ADD_VARIABLE_BUTTON_MARGIN_BOTTOM,
  BACKDROP_PADDING,
  TITLE_BLOCK_HEIGHT,
} from '../ui-constants';
import { BaseHandle, HANDLE_HEIGHT, HANDLE_WIDTH } from './common';

const IncomingConnectorHandleImpl = styled(BaseHandle)`
  background: #00b3ff;
  left: -${HANDLE_WIDTH / 2 - BACKDROP_PADDING / 2}px;
`;

export default function IncomingVariableHandle(
  props: Omit<
    ComponentProps<typeof IncomingConnectorHandleImpl>,
    'position' | 'type'
  > & {
    index?: number;
    inputVariableBlockHeightList?: number[];
    isShowingAddInputVariableButton?: boolean;
  },
) {
  const {
    index = 0,
    inputVariableBlockHeightList = [],
    isShowingAddInputVariableButton = false,
    ...restProps
  } = props;

  return (
    <IncomingConnectorHandleImpl
      {...restProps}
      position={Position.Left}
      type="target"
      style={{
        ...props.style,
        top: calcTop(
          index,
          inputVariableBlockHeightList,
          isShowingAddInputVariableButton,
        ),
      }}
    />
  );
}

function calcTop(
  index: number,
  inputVariableBlockHeightList: number[],
  isShowingAddInputVariableButton: boolean,
) {
  let headerSectionHeight = BACKDROP_PADDING + TITLE_BLOCK_HEIGHT;

  if (isShowingAddInputVariableButton) {
    headerSectionHeight +=
      ADD_VARIABLE_BUTTON_HEIGHT + ADD_VARIABLE_BUTTON_MARGIN_BOTTOM;
  }

  const center = VARIABLE_LABEL_HEIGHT / 2 - HANDLE_HEIGHT / 2;

  return (
    headerSectionHeight +
    center +
    inputVariableBlockHeightList
      .slice(0, index)
      .reduce<number>((acc, height) => acc + height, 0)
  );
}
