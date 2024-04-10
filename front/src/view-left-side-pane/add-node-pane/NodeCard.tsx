import { useDraggable } from '@dnd-kit/core';
import styled from '@emotion/styled';
import { Card } from '@mui/joy';

import type { NodeTypeEnum } from 'flow-models';

type Props = {
  nodeType: NodeTypeEnum;
  label: string;
};

function NodeCard(props: Props) {
  const { attributes, listeners, setNodeRef } = useDraggable({
    id: props.nodeType,
  });

  return (
    <StyledCard ref={setNodeRef} {...listeners} {...attributes}>
      {props.label}
    </StyledCard>
  );
}

const StyledCard = styled(Card)`
  margin-top: 10px;
  margin-bottom: 10px;
  cursor: pointer;
`;

export default NodeCard;
