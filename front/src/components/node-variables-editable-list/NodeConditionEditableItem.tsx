import styled from '@emotion/styled';
import { Control, FieldArrayWithId } from 'react-hook-form';

import DragHandle from './DragHandle';
import NodeConnectorEditor from './NodeConnectorEditor';
import NodeConnectorResultDisplay from './NodeConnectorResultDisplay';
import { ConditionConfig, FieldValues } from './types';

type Props = {
  isNodeReadOnly: boolean;
  isListSortable: boolean;
  condition: ConditionConfig;
  control: Control<FieldValues>;
  formField: FieldArrayWithId<FieldValues, 'list', 'id'>;
  index: number;
  onUpdate: () => void;
  onRemove: () => void;
  onClickResult?: () => void;
};

function NodeConditionEditableItem(props: Props) {
  return (
    <Container>
      <DragHandle />
      <EditorContainer>
        <EditorRow>
          <NodeConnectorEditor
            isReadOnly={props.isNodeReadOnly || props.condition.isReadOnly}
            control={props.control}
            formField={props.formField}
            index={props.index}
            onUpdate={props.onUpdate}
            onRemove={props.onRemove}
          />
        </EditorRow>
        <StyledNodeConnectorResultDisplay
          label="is matched"
          value={props.condition.isMatched}
          onClick={props.onClickResult}
        />
      </EditorContainer>
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  gap: 5px;
  margin-top: 10px;
  margin-bottom: 10px;
`;

const EditorContainer = styled.div`
  flex-grow: 1;
`;

const EditorRow = styled.div`
  display: flex;
  gap: 5px;
  margin-bottom: 5px;
`;

const StyledNodeConnectorResultDisplay = styled(NodeConnectorResultDisplay)`
  margin-bottom: 0;
  cursor: initial;
`;

export default NodeConditionEditableItem;
