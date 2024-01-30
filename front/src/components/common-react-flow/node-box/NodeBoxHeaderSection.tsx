import styled from '@emotion/styled';
import IconThreeDots from '../../icons/IconThreeDots';
import {
  DRAG_HANDLE_CLASS_NAME,
  HEADER_TITLE_HEIGHT,
  HEADER_TITLE_MARGIN_BOTTOM,
  HEADER_TITLE_PADDING_TOP,
} from '../ui-constants';
import NodeBoxCommonRemoveButton from './NodeBoxCommonRemoveButton';

type Props = {
  title: string;
  isReadOnly: boolean;
  onClickRemove: () => void;
};

export default function NodeBoxHeaderSection(props: Props) {
  return (
    <Container>
      <TitleContainer className={DRAG_HANDLE_CLASS_NAME}>
        <Title>{props.title}</Title>
        <DragHandle />
      </TitleContainer>
      {props.isReadOnly && (
        <RemoveButtonContainer>
          <NodeBoxCommonRemoveButton onClick={props.onClickRemove} />
        </RemoveButtonContainer>
      )}
    </Container>
  );
}

const Container = styled.div`
  position: relative;
  margin-bottom: ${HEADER_TITLE_MARGIN_BOTTOM}px;
`;

const TitleContainer = styled.div`
  cursor: grab;
  padding: ${HEADER_TITLE_PADDING_TOP}px 10px 0;
`;

const Title = styled.h3`
  margin: 0;
  font-size: 16px;
  line-height: ${HEADER_TITLE_HEIGHT}px;
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
