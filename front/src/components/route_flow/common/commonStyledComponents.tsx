import { Handle } from "reactflow";
import styled from "styled-components";

export const CONTAINER_BORDER = 1;
export const CONTAINER_PADDING = 10;
export const VARIABLE_LABEL_HEIGHT = 32;
export const SECTION_MARGIN_BOTTOM = 10;
export const HANDLE_RADIUS = 15;

export const StyledHandle = styled(Handle)`
  width: ${HANDLE_RADIUS}px;
  height: ${HANDLE_RADIUS}px;
  background: #5cc5e0;
  transform: none;
`;

export const InputHandle = styled(StyledHandle)`
  left: -${HANDLE_RADIUS / 2}px;
`;

export const OutputHandle = styled(StyledHandle)`
  top: unset;
  right: -${HANDLE_RADIUS / 2}px;
  bottom: ${CONTAINER_PADDING +
  VARIABLE_LABEL_HEIGHT / 2 -
  HANDLE_RADIUS / 2}px;
`;

export const Section = styled.div`
  margin-bottom: ${SECTION_MARGIN_BOTTOM}px;

  &:last-child {
    margin-bottom: 0;
  }
`;

export const HeaderSection = styled(Section)`
  display: flex;
  justify-content: space-between;
`;

export const RawValue = styled.pre`
  margin: 0;
  border: 1px solid #ddd;
  padding: 10px;
  border-radius: 5px;
  white-space: pre-wrap;
`;
