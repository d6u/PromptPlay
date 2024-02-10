import styled from '@emotion/styled';
import { ComponentProps } from 'react';
import { Position } from 'reactflow';

import { CONNECTOR_RESULT_DISPLAY_HEIGHT } from 'components/node-variables-editable-list/constants';

import { BACKDROP_PADDING, HEADER_SECTION_HEIGHT } from '../constants';
import { BaseHandle, HANDLE_HEIGHT, HANDLE_WIDTH } from './common';

function IncomingVariableHandle(
  props: Omit<
    ComponentProps<typeof IncomingConnectorHandleImpl>,
    'position' | 'type'
  > & {
    index?: number;
    inputVariableBlockHeightList?: number[];
  },
) {
  const { index = 0, inputVariableBlockHeightList = [], ...restProps } = props;

  return (
    <IncomingConnectorHandleImpl
      {...restProps}
      position={Position.Left}
      type="target"
      style={{
        ...props.style,
        top: calcTop(index, inputVariableBlockHeightList),
      }}
    />
  );
}

const IncomingConnectorHandleImpl = styled(BaseHandle)`
  background: #00b3ff;
  left: -${HANDLE_WIDTH / 2 - BACKDROP_PADDING / 2}px;
`;

function calcTop(index: number, inputVariableBlockHeightList: number[]) {
  const CENTER = CONNECTOR_RESULT_DISPLAY_HEIGHT / 2 - HANDLE_HEIGHT / 2;

  return (
    BACKDROP_PADDING +
    HEADER_SECTION_HEIGHT +
    CENTER +
    inputVariableBlockHeightList
      .slice(0, index)
      .reduce<number>((acc, height) => acc + height, 0)
  );
}

export default IncomingVariableHandle;
