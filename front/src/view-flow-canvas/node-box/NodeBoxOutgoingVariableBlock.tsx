import styled from '@emotion/styled';
import { CSSProperties } from 'react';

import { ROW_MARGIN_TOP } from 'components/node-variables-editable-list/NodeBoxVariableEditableItem';
import { useFlowStore } from 'state-flow/context/FlowStoreContext';
import { CanvasRightPanelType } from 'state-flow/types';

type Props = {
  id: string;
  name: string;
  value?: unknown;
  onClick?: () => void;
  style?: CSSProperties;
};

export default function NodeBoxOutgoingVariableBlock(props: Props) {
  const setCanvasRightPaneType = useFlowStore((s) => s.setCanvasRightPaneType);

  return (
    <Container style={props.style}>
      <Content
        onClick={
          props.onClick ??
          (() => {
            setCanvasRightPaneType(CanvasRightPanelType.Tester);
          })
        }
      >
        {props.value !== undefined ? (
          <>
            <Name>{props.name} =&nbsp;</Name>
            <Value>{JSON.stringify(props.value)}</Value>
          </>
        ) : (
          <Name>{props.name}</Name>
        )}
      </Content>
    </Container>
  );
}

// SECTION: UI Components

export const VARIABLE_LABEL_HEIGHT = 32;

const Container = styled.div`
  margin-bottom: ${ROW_MARGIN_TOP}px;
  display: flex;
  gap: 5px;
  align-items: center;

  &:last-child {
    margin-bottom: 0;
  }
`;

const Content = styled.div`
  height: ${VARIABLE_LABEL_HEIGHT}px;
  padding: 0 10px;
  border: 1px solid blue;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-radius: 5px;
  min-width: 0;
  flex-grow: 1;
  cursor: pointer;
  font-size: 14px;
`;

const Name = styled.code`
  white-space: nowrap;
`;

const Value = styled.code`
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
`;

// !SECTION
