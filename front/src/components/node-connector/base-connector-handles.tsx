import styled from '@emotion/styled';
import { Handle } from 'reactflow';

export const HANDLE_WIDTH = 15;
export const HANDLE_HEIGHT = 34;

const BaseConnectorHandle = styled(Handle)`
  width: ${HANDLE_WIDTH}px;
  height: ${HANDLE_HEIGHT}px;
  border-radius: ${HANDLE_WIDTH / 2}px;
`;

export const BaseVariableHandle = styled(BaseConnectorHandle)`
  background: #00b3ff;
`;

export const BaseConditionHandle = styled(BaseConnectorHandle)`
  background: #7a00df;
`;
