import styled from '@emotion/styled';
import { ComponentProps } from 'react';

import DragHandleIcon from 'icons/DragHandleIcon';

function DragHandle(props: ComponentProps<'div'>) {
  return (
    <Container {...props}>
      <StyledDragHandleIcon />
    </Container>
  );
}

const Container = styled.div`
  width: 16px;
  display: flex;
  align-items: center;
  cursor: grab;
  padding: 2px;
`;

const StyledDragHandleIcon = styled(DragHandleIcon)`
  fill: gray;
`;

export default DragHandle;
