import styled from '@emotion/styled';

import RemoveButton from 'generic-components/RemoveButton';
import IconThreeDots from 'icons/IconThreeDots';

import {
  DRAG_HANDLE_CLASS_NAME,
  NODE_BOX_HEADER_SECTION_MARGIN_BOTTOM,
  NODE_BOX_HEADER_SECTION_PADDING_TOP,
  NODE_BOX_HEADER_SECTION_TITLE_HEIGHT,
  NODE_BOX_HEADER_SUB_SECTION_PADDING_MARGIN_BETWEEN,
} from '../constants';
import NodeBoxAddConnectorButton from './NodeBoxAddConnectorButton';
import NodeBoxGearButton from './NodeBoxIconGear';

type Props = {
  title: string;
  isReadOnly: boolean;
  onClickRemove: () => void;
  onClickGearButton: () => void;
  showAddVariableButton: boolean;
  onClickAddVariableButton?: () => void;
};

function NodeBoxHeaderSection(props: Props) {
  return (
    <Container>
      <TitleSection>
        <TitleContainer className={DRAG_HANDLE_CLASS_NAME}>
          <Title>{props.title}</Title>
          <DragHandle />
        </TitleContainer>
        {!props.isReadOnly && (
          <RemoveButtonContainer>
            <RemoveButton onClick={props.onClickRemove} />
          </RemoveButtonContainer>
        )}
      </TitleSection>
      <ActionsSection>
        <NodeBoxGearButton onClick={props.onClickGearButton} />
        {!props.isReadOnly &&
          props.showAddVariableButton &&
          props.onClickAddVariableButton && (
            <NodeBoxAddConnectorButton
              label="Variable"
              onClick={props.onClickAddVariableButton}
            />
          )}
      </ActionsSection>
    </Container>
  );
}

const Container = styled.div`
  margin-bottom: ${NODE_BOX_HEADER_SECTION_MARGIN_BOTTOM}px;
`;

const TitleSection = styled.div`
  position: relative;
  margin-bottom: ${NODE_BOX_HEADER_SUB_SECTION_PADDING_MARGIN_BETWEEN}px;
`;

const TitleContainer = styled.div`
  cursor: grab;
  padding-top: ${NODE_BOX_HEADER_SECTION_PADDING_TOP}px;
  padding-left: 10px;
  padding-right: 10px;
`;

const Title = styled.h3`
  margin: 0;
  font-size: 16px;
  line-height: ${NODE_BOX_HEADER_SECTION_TITLE_HEIGHT}px;
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

const ActionsSection = styled.div`
  display: flex;
  gap: 5px;
  padding-left: 10px;
  padding-right: 10px;
  margin-top: 5px;
`;

export default NodeBoxHeaderSection;
