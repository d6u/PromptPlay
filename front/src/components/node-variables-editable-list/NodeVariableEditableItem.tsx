import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import styled from '@emotion/styled';
import { Control, FieldArrayWithId } from 'react-hook-form';
import { Position } from 'reactflow';

import NodeFieldHelperTextWithStatus from 'components/node-fields/NodeFieldHelperTextWithStatus';
import BaseFlowHandle from 'components/node-variables-editable-list/BaseFlowHandle';

import DragHandle from './DragHandle';
import NodeVariableEditor from './NodeVariableEditor';
import { VariableConfig, VariableFormValue } from './types';

export type HandlePosition = Position.Left | Position.Right | 'none';

type Props = {
  // Won't change within current session
  isListSortable: boolean;
  showConnectorHandle: HandlePosition;
  // Node level
  isNodeReadOnly: boolean;
  // Variable level
  index: number;
  variable: VariableConfig;
  // react-hook-form
  control: Control<VariableFormValue>;
  formField: FieldArrayWithId<VariableFormValue, 'list', 'id'>;
  // Callbacks
  onRemove: () => void;
  onUpdateTrigger: () => void;
};

function NodeVariableEditableItem(props: Props) {
  const isSortableEnabledForThisRow =
    !props.isNodeReadOnly && !props.variable.isReadOnly && props.isListSortable;

  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
      id: props.formField.id,
      disabled: !isSortableEnabledForThisRow,
    });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <Container ref={setNodeRef} style={style} {...attributes}>
      {props.showConnectorHandle !== 'none' && (
        <StyledBaseFlowHandle
          type={
            props.showConnectorHandle === Position.Left ? 'target' : 'source'
          }
          position={props.showConnectorHandle}
          id={props.variable.id}
          style={{
            left: props.showConnectorHandle === Position.Left ? -19 : undefined,
            right:
              props.showConnectorHandle === Position.Left ? undefined : -19,
          }}
        />
      )}
      <InputContainer>
        {isSortableEnabledForThisRow && <DragHandle {...listeners} />}
        <NodeVariableEditor
          isReadOnly={props.isNodeReadOnly || props.variable.isReadOnly}
          control={props.control}
          formField={props.formField}
          index={props.index}
          onRemove={props.onRemove}
          onUpdateTrigger={props.onUpdateTrigger}
        />
      </InputContainer>
      {props.variable.helperText && (
        <HelperTextContainer>
          <NodeFieldHelperTextWithStatus>
            {props.variable.helperText}
          </NodeFieldHelperTextWithStatus>
        </HelperTextContainer>
      )}
    </Container>
  );
}

// ANCHOR: UI

export const ROW_MARGIN_TOP = 5;

const Container = styled.div`
  position: relative;
  margin-top: ${ROW_MARGIN_TOP}px;
  margin-bottom: ${ROW_MARGIN_TOP}px;
`;

const InputContainer = styled.div`
  display: flex;
  gap: 5px;
`;

const HelperTextContainer = styled.div`
  margin-top: 5px;
  margin-bottom: 10px;
`;

const StyledBaseFlowHandle = styled(BaseFlowHandle)`
  background: #00b3ff;
`;

export default NodeVariableEditableItem;
