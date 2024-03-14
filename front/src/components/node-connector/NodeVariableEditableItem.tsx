import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import styled from '@emotion/styled';
import { Control, FieldArrayWithId, useController } from 'react-hook-form';
import { Position } from 'reactflow';

import NodeFieldHelperTextWithStatus from 'components/node-fields/NodeFieldHelperTextWithStatus';
import { useFlowStore } from 'state-flow/flow-store';
import { EdgeConnectStartConnectorClass } from 'state-flow/types';

import RemoveButton from 'generic-components/RemoveButton';
import ToggleGlobalVariableButton from 'generic-components/ToggleGlobalVariableButton';
import DragHandle from './DragHandle';
import NodeVariableEditor from './NodeVariableEditor';
import { BaseVariableHandle } from './base-connector-handles';
import { VariableConfig, VariableFormValue } from './types';

export type HandlePosition = Position.Left | Position.Right | 'none';

type Props = {
  // Won't change within current session
  isListSortable: boolean;
  connectorHandlePosition: HandlePosition;
  // Node level
  nodeId: string;
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

  const paramsOnUserStartConnectingEdge = useFlowStore(
    (s) => s.paramsOnUserStartConnectingEdge,
  );

  let grayOutHandle = false;

  if (paramsOnUserStartConnectingEdge) {
    const { nodeId, handleId, handleType, connectorClass } =
      paramsOnUserStartConnectingEdge;

    const isThisTheStartHandle = handleId === props.variable.id;
    const isThisOnTheSameNode = nodeId === props.nodeId;
    const isThisInTheSameConnectorClass =
      connectorClass === EdgeConnectStartConnectorClass.Variable;
    const isThisTheSameHandleType =
      (handleType === 'source' &&
        props.connectorHandlePosition === Position.Right) ||
      (handleType === 'target' &&
        props.connectorHandlePosition === Position.Left);

    grayOutHandle =
      !isThisTheStartHandle &&
      (isThisOnTheSameNode ||
        !isThisInTheSameConnectorClass ||
        isThisTheSameHandleType);
  }

  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
      id: props.formField.id,
      disabled: !isSortableEnabledForThisRow,
    });

  const { field: isGlobalField } = useController({
    name: `list.${props.index}.isGlobal`,
    control: props.control,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const isVariableReadOnly = props.isNodeReadOnly || props.variable.isReadOnly;

  return (
    <Container ref={setNodeRef} style={style} {...attributes}>
      {props.connectorHandlePosition !== 'none' && (
        <BaseVariableHandle
          type={
            props.connectorHandlePosition === Position.Left
              ? 'target'
              : 'source'
          }
          position={props.connectorHandlePosition}
          id={props.variable.id}
          style={{
            left:
              props.connectorHandlePosition === Position.Left ? -19 : undefined,
            right:
              props.connectorHandlePosition === Position.Left ? undefined : -19,
            background: grayOutHandle ? '#c2c2c2' : undefined,
            cursor: grayOutHandle ? 'not-allowed' : undefined,
          }}
        />
      )}
      <InputContainer>
        {isSortableEnabledForThisRow && <DragHandle {...listeners} />}
        <NodeVariableEditor
          isReadOnly={isVariableReadOnly}
          control={props.control}
          formField={props.formField}
          index={props.index}
          onRemove={props.onRemove}
          onUpdateTrigger={props.onUpdateTrigger}
        />
        {!props.isNodeReadOnly && (
          <ToggleGlobalVariableButton
            isActive={isGlobalField.value}
            onClick={() => {
              isGlobalField.onChange(!isGlobalField.value);
              props.onUpdateTrigger();
            }}
          />
        )}
        {!isVariableReadOnly && (
          <RemoveButton
            onClick={() => {
              props.onRemove();
              props.onUpdateTrigger();
            }}
          />
        )}
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
