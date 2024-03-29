import styled from '@emotion/styled';

import RemoveButton from 'generic-components/RemoveButton';
import IconThreeDots from 'icons/IconThreeDots';
import { useFlowStore } from 'state-flow/flow-store';

import NodeAddConnectorButton from '../../components/NodeAddConnectorButton';
import {
  DRAG_HANDLE_CLASS_NAME,
  NODE_BOX_HEADER_SECTION_MARGIN_BOTTOM,
  NODE_BOX_HEADER_SECTION_PADDING_TOP,
  NODE_BOX_HEADER_SECTION_TITLE_HEIGHT,
  NODE_BOX_HEADER_SUB_SECTION_PADDING_MARGIN_BETWEEN,
} from '../constants';
import NodeBoxGearButton from './NodeBoxIconGear';

type Props = {
  // Static values
  title: string;
  // Node Level
  nodeId: string;
  isNodeReadOnly: boolean;
} & (
  | { showAddVariableButton: false }
  | {
      showAddVariableButton: true;
      onClickAddVariableButton: () => void;
    }
);

function NodeBoxHeaderSection(props: Props) {
  const removeNode = useFlowStore((s) => s.removeNode);
  const setCanvasLeftPaneIsOpen = useFlowStore(
    (s) => s.setCanvasLeftPaneIsOpen,
  );
  const setCanvasLeftPaneSelectedNodeId = useFlowStore(
    (s) => s.setCanvasLeftPaneSelectedNodeId,
  );

  return (
    <Container>
      <TitleSection>
        <TitleContainer className={DRAG_HANDLE_CLASS_NAME}>
          <Title>{props.title}</Title>
          <DragHandle />
        </TitleContainer>
        {!props.isNodeReadOnly && (
          <RemoveButtonContainer>
            <RemoveButton onClick={() => removeNode(props.nodeId)} />
          </RemoveButtonContainer>
        )}
      </TitleSection>
      <ActionsSection>
        <NodeBoxGearButton
          onClick={() => {
            setCanvasLeftPaneIsOpen(true);
            setCanvasLeftPaneSelectedNodeId(props.nodeId);
          }}
        />
        {!props.isNodeReadOnly &&
          props.showAddVariableButton &&
          props.onClickAddVariableButton && (
            <NodeAddConnectorButton
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
