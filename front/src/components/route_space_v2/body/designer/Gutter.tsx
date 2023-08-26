import { useDroppable } from "@dnd-kit/core";
import styled from "@emotion/styled";

const Box = styled.div<{ isOver: boolean }>`
  width: 692px;
  height: 4px;
  align-self: stretch;
  border-radius: 5px;
  ${(props) => props.isOver && "background: #00b3ff;"};
`;

export default function Gutter({
  preItemId,
  isDisabled,
}: {
  preItemId: string;
  isDisabled: boolean;
}) {
  const { isOver, setNodeRef } = useDroppable({
    id: preItemId,
    disabled: isDisabled,
  });

  return <Box isOver={isOver} ref={setNodeRef}></Box>;
}
