import styled from "styled-components";
import IconThreeDots from "../../icons/IconThreeDots";
import {
  CONTAINER_BORDER,
  CONTAINER_PADDING,
} from "../common/commonStyledComponents";

export const DRAG_HANDLE_CLASS_NAME = "node-drag-handle";

const Content = styled.div`
  background: #fff;
  border: ${CONTAINER_BORDER}px solid #000;
  border-radius: 5px;
  padding: ${CONTAINER_PADDING}px;
  position: relative;
  cursor: initial;
`;

const DragHandle = styled(IconThreeDots)`
  fill: #cacaca;
  width: 30px;
  position: absolute;
  top: 0;
  left: calc(50% - 30px / 2);
  cursor: grab;
`;

type Props = {
  children: React.ReactNode;
};

export default function NodeBox(props: Props) {
  return (
    <Content>
      <DragHandle className={DRAG_HANDLE_CLASS_NAME} />
      {props.children}
    </Content>
  );
}
