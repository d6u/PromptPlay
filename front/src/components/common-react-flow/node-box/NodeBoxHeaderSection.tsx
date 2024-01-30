import styled from '@emotion/styled';
import IconThreeDots from '../../icons/IconThreeDots';
import RemoveButton from '../../route-canvas/flow-canvas/nodes/node-common/RemoveButton';
import { DRAG_HANDLE_CLASS_NAME } from '../../route-flow/utils/constants';
import {
  TITLE_HEIGHT,
  TITLE_MARGIN_BOTTOM,
  TITLE_PADDING_TOP,
} from '../ui-constants';

type Props = {
  isCurrentUserOwner: boolean;
  title: string;
  onClickRemove: () => void;
};

export default function NodeBoxHeaderSection(props: Props) {
  return (
    <Container>
      <TitleContainer className={DRAG_HANDLE_CLASS_NAME}>
        <Title>{props.title}</Title>
        <DragHandle />
      </TitleContainer>
      {props.isCurrentUserOwner && (
        <RemoveButtonContainer>
          <RemoveButton onClick={props.onClickRemove} />
        </RemoveButtonContainer>
      )}
    </Container>
  );
}

const Container = styled.div`
  position: relative;
`;

const TitleContainer = styled.div`
  cursor: grab;
  padding: ${TITLE_PADDING_TOP}px 10px 0;
  margin-bottom: ${TITLE_MARGIN_BOTTOM}px;
`;

const Title = styled.h3`
  margin: 0;
  font-size: 16px;
  line-height: ${TITLE_HEIGHT}px;
`;

const DragHandle = styled(IconThreeDots)`
  fill: #cacaca;
  width: 20px;
  position: absolute;
  top: -3px;
  left: calc(50% - 30px / 2);
`;

const RemoveButtonContainer = styled.div`
  position: absolute;
  top: 10px;
  right: 10px;
`;
