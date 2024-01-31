import styled from '@emotion/styled';
import { Handle } from 'reactflow';

export const HANDLE_WIDTH = 15;
export const HANDLE_HEIGHT = 34;

export const BaseHandle = styled(Handle)`
  width: ${HANDLE_WIDTH}px;
  height: ${HANDLE_HEIGHT}px;
  border-radius: ${HANDLE_WIDTH / 2}px;
  transform: none;
`;