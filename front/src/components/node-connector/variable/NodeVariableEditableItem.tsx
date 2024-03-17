import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import styled from '@emotion/styled';
import { Control, FieldArrayWithId, useController } from 'react-hook-form';
import { Position } from 'reactflow';

import NodeFieldHelperTextWithStatus from 'components/node-fields/NodeFieldHelperTextWithStatus';
import RemoveButton from 'generic-components/RemoveButton';
import ToggleGlobalVariableButton from 'generic-components/ToggleGlobalVariableButton';
import { useFlowStore } from 'state-flow/flow-store';
import { EdgeConnectStartConnectorClass } from 'state-flow/types';

import DragHandle from '../DragHandle';
import { BaseVariableHandle, HANDLE_HEIGHT } from '../base-connector-handles';
import { VariableConfig, VariableFormValue } from '../types';
import NodeVariableEditor from './NodeVariableEditor';
import NodeVariableGlobalVariableConfigRow from './NodeVariableGlobalVariableConfigRow';

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
    !props.isNodeReadOnly &&
    !props.variable.isVariableFixed &&
    props.isListSortable;

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

  const { field: formFieldIsGlobal } = useController({
    name: `list.${props.index}.isGlobal`,
    control: props.control,
  });

  const isVariableReadOnly =
    props.isNodeReadOnly || props.variable.isVariableFixed;

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    // Because each item might have different height due to `isGlobal`,
    // specify explicit height to avoid sizing issue when sorting.
    //
    // This would be problematic if this item has `helperText`,
    // because `helperText` height is cannot be determined in advance.
    //
    // But it's OK for now since when `isVariableFixed` is true
    //  of sortable variable has `helperText`.
    height: !isVariableReadOnly && props.variable.isGlobal ? 69 : undefined,
  };

  return (
    <Container ref={setNodeRef} style={style} {...attributes}>
      {props.connectorHandlePosition !== 'none' && !props.variable.isGlobal && (
        <BaseVariableHandle
          type={
            props.connectorHandlePosition === Position.Left
              ? 'target'
              : 'source'
          }
          position={props.connectorHandlePosition}
          id={props.variable.id}
          style={{
            top: HANDLE_HEIGHT / 2,
            left:
              props.connectorHandlePosition === Position.Left ? -19 : undefined,
            right:
              props.connectorHandlePosition === Position.Left ? undefined : -19,
            background: grayOutHandle ? '#c2c2c2' : undefined,
            cursor: grayOutHandle ? 'not-allowed' : undefined,
          }}
        />
      )}
      <BoxA>
        {isSortableEnabledForThisRow && <DragHandle {...listeners} />}
        <BoxAA>
          <VariableConfigRow>
            <NodeVariableEditor
              isReadOnly={isVariableReadOnly}
              control={props.control}
              formField={props.formField}
              index={props.index}
              onRemove={props.onRemove}
              onUpdateTrigger={props.onUpdateTrigger}
            />
            {props.isNodeReadOnly && !props.variable.isGlobal ? null : (
              <ToggleGlobalVariableButton
                disabled={props.isNodeReadOnly}
                isActive={formFieldIsGlobal.value}
                onClick={() => {
                  if (!props.isNodeReadOnly) {
                    formFieldIsGlobal.onChange(!formFieldIsGlobal.value);
                    props.onUpdateTrigger();
                  }
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
          </VariableConfigRow>
          {props.variable.isGlobal && (
            <NodeVariableGlobalVariableConfigRow
              isNodeReadOnly={props.isNodeReadOnly}
              variable={props.variable}
              control={props.control}
              formField={props.formField}
              index={props.index}
              onUpdateTrigger={props.onUpdateTrigger}
            />
          )}
          {props.variable.helperText && (
            <HelperTextRow>
              <NodeFieldHelperTextWithStatus>
                {props.variable.helperText}
              </NodeFieldHelperTextWithStatus>
            </HelperTextRow>
          )}
        </BoxAA>
      </BoxA>
    </Container>
  );
}

const Container = styled.div`
  margin-top: 10px;
  margin-bottom: 10px;
  position: relative;
`;

const BoxA = styled.div`
  display: flex;
  gap: 5px;
`;

const BoxAA = styled.div`
  flex-grow: 1;
`;

const VariableConfigRow = styled.div`
  display: flex;
  gap: 5px;
`;

const HelperTextRow = styled.div`
  margin-top: 5px;
`;

export default NodeVariableEditableItem;
