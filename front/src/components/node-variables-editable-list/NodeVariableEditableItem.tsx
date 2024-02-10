import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import styled from '@emotion/styled';
import { useCallback, useRef } from 'react';
import { Control, FieldArrayWithId } from 'react-hook-form';

import { useOnElementResize } from 'generic-util/ResizeObserver';

import NodeFieldHelperTextWithStatus from '../node-fields/NodeFieldHelperTextWithStatus';
import DragHandle from './DragHandle';
import NodeConnectorEditor from './NodeConnectorEditor';
import { FieldValues, VariableConfig } from './types';

type Props = {
  isNodeReadOnly: boolean;
  isListSortable: boolean;
  variable: VariableConfig;
  control: Control<FieldValues>;
  formField: FieldArrayWithId<FieldValues, 'list', 'id'>;
  index: number;
  onUpdate: () => void;
  onRemove: () => void;
  onHeightChange?: (height: number) => void;
};

function NodeVariableEditableItem(props: Props) {
  const { onHeightChange } = props;

  const isSortableEnabledForThisRow =
    !props.isNodeReadOnly && !props.variable.isReadOnly && props.isListSortable;

  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
      id: props.formField.id,
      disabled: !isSortableEnabledForThisRow,
    });

  const containerRef = useRef<HTMLDivElement | null>(null);
  const prevHeightRef = useRef<number>(0);

  // TODO: Don't attach observer when onHeightChange is not provided
  useOnElementResize(
    containerRef,
    useCallback(
      (contentRect) => {
        const newHeight = contentRect.height;

        if (prevHeightRef.current !== newHeight) {
          prevHeightRef.current = newHeight;

          onHeightChange?.(
            prevHeightRef.current + (props.variable.helperText ? 10 : 5),
          );
        }
      },
      [props.variable.helperText, onHeightChange],
    ),
  );

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <Container
      ref={(ref) => {
        setNodeRef(ref);
        containerRef.current = ref;
      }}
      style={style}
      {...attributes}
    >
      <InputContainer>
        {isSortableEnabledForThisRow && <DragHandle {...listeners} />}
        <NodeConnectorEditor
          isReadOnly={props.isNodeReadOnly || props.variable.isReadOnly}
          control={props.control}
          formField={props.formField}
          index={props.index}
          onUpdate={props.onUpdate}
          onRemove={props.onRemove}
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

export default NodeVariableEditableItem;
