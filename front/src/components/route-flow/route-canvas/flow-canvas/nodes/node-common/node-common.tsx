import styled from '@emotion/styled';
import { Handle, Position } from 'reactflow';
import IconGear from '../../../../../icons/IconGear';
import { BACKDROP_PADDING } from './NodeBox';

export const SECTION_PADDING_BOTTOM = 10;
export const HANDLE_WIDTH = 15;
export const HANDLE_HEIGHT = 34;

// SECTION: Handle

// ANCHOR: Base Handle

const StyleVerticaldHandle = styled(Handle)`
  width: ${HANDLE_WIDTH}px;
  height: ${HANDLE_HEIGHT}px;
  border-radius: ${HANDLE_WIDTH / 2}px;
  transform: none;
`;

// ANCHOR: Input Handle

export const InputHandle = styled(StyleVerticaldHandle)`
  background: #00b3ff;
  left: -${HANDLE_WIDTH / 2 - BACKDROP_PADDING / 2}px;
`;

// ANCHOR: Output Handle

export const OutputHandle = styled(StyleVerticaldHandle)`
  background: #00b3ff;
  top: unset;
  right: -${HANDLE_WIDTH / 2 - BACKDROP_PADDING / 2}px;
`;

// ANCHOR: Condition Handle

export const ConditionHandle = styled(StyleVerticaldHandle)`
  background: #7a00df;
  top: unset;
  right: -${HANDLE_WIDTH / 2 - BACKDROP_PADDING / 2}px;
`;

// ANCHOR: Condition Target Handle

export const ConditionTargetHandleImpl = styled(StyleVerticaldHandle)`
  background: #7a00df;
  top: 12px;
  left: -${HANDLE_WIDTH / 2 - BACKDROP_PADDING / 2}px;
`;

type ConditionTargetHandleProps = {
  controlId: string;
};

export function ConditionTargetHandle(props: ConditionTargetHandleProps) {
  return (
    <ConditionTargetHandleImpl
      type="target"
      position={Position.Left}
      id={props.controlId}
      // TODO: Hide and show this handle based on the connect start handle type.
      //
      // NOTE: Because we are using @emotion/styled, it doesn't seem to support
      // transient props that styled-components supports. Thus, we use style
      // prop instead.
      // https://styled-components.com/docs/api#transient-props
      style={{ visibility: 'visible' }}
    />
  );
}

// !SECTION

export const Section = styled.div`
  padding: 0 10px ${SECTION_PADDING_BOTTOM}px;
`;

export const SmallSection = styled(Section)`
  padding: 0 10px 5px;
  display: flex;
  gap: 5px;
`;

export const StyledIconGear = styled(IconGear)`
  width: 20px;
  fill: #636b74;
`;
