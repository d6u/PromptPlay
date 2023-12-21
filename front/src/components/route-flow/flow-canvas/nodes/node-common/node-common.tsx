import styled from '@emotion/styled';
import { Handle, Position } from 'reactflow';
import IconGear from '../../../../icons/IconGear';
import { BACKDROP_PADDING } from './NodeBox';

export const SECTION_PADDING_BOTTOM = 10;
export const HANDLE_WIDTH = 15;
export const HANDLE_HEIGHT = 34;

export const StyledHandle = styled(Handle)`
  width: ${HANDLE_WIDTH}px;
  height: ${HANDLE_HEIGHT}px;
  border-radius: ${HANDLE_WIDTH / 2}px;
  background: #00b3ff;
  transform: none;
`;

export const InputHandle = styled(StyledHandle)`
  left: -${HANDLE_WIDTH / 2 - BACKDROP_PADDING / 2}px;
`;

export const OutputHandle = styled(StyledHandle)`
  top: unset;
  right: -${HANDLE_WIDTH / 2 - BACKDROP_PADDING / 2}px;
`;

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

const ConditionInHandleImpl = styled(Handle)`
  width: ${HANDLE_HEIGHT}px;
  height: ${HANDLE_WIDTH}px;
  border-radius: ${HANDLE_WIDTH / 2}px;
  background: #0057df;
  transform: none;
  top: -${HANDLE_WIDTH / 2 - BACKDROP_PADDING / 2}px;
  // Align with node title
  left: 12px;
`;

export function ConditionInHandle() {
  return <ConditionInHandleImpl type="target" position={Position.Top} />;
}
