import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import styled from '@emotion/styled';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { Position } from 'reactflow';

import NodeVariableToggleIsGlobalButton from 'components/node-connector/variable/NodeVariableToggleIsGlobalButton';
import NodeFieldHelperTextWithStatus from 'components/node-fields/NodeFieldHelperTextWithStatus';
import RemoveButton from 'generic-components/RemoveButton';
import { EdgeConnectStartConnectorClass } from 'state-flow/common-types';
import { useFlowStore } from 'state-flow/flow-store';

import DragHandle from '../DragHandle';
import { BaseVariableHandle, HANDLE_HEIGHT } from '../base-connector-handles';
import { VariableConfig, type VariableDefinition } from '../types';
import NodeRenamableVariableNameInput from './NodeRenamableVariableNameInput';
import NodeVariableGlobalVariableSelectorRow from './NodeVariableGlobalVariableConfigRow';

export type HandlePosition = Position.Left | Position.Right | 'none';

type Props = {
  // Won't change within current session
  isListSortable: boolean;
  connectorHandlePosition: HandlePosition;
  // Node level
  nodeId: string;
  isNodeReadOnly: boolean;
  // Variable level
  variable: VariableConfig;
  variableDefinition: VariableDefinition;
  value: VariableConfig;
  onChange: (value: VariableConfig) => void;
  onRemove: () => void;
};

function NodeRenamableVariableItem(props: Props) {
  const { setValue, getValues, handleSubmit } = useForm<VariableConfig>({
    values: props.value,
  });

  const onChange = useMemo(() => {
    return handleSubmit(props.onChange);
  }, [handleSubmit, props]);

  const isSortableEnabledForThisRow =
    !props.isNodeReadOnly &&
    !props.variableDefinition.isVariableFixed &&
    props.isListSortable;

  const paramsOnUserStartConnectingEdge = useFlowStore(
    (s) => s.paramsOnUserStartConnectingEdge,
  );

  const grayOutHandle = useMemo(() => {
    if (!paramsOnUserStartConnectingEdge) {
      return false;
    }

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

    return (
      !isThisTheStartHandle &&
      (isThisOnTheSameNode ||
        !isThisInTheSameConnectorClass ||
        isThisTheSameHandleType)
    );
  }, [
    paramsOnUserStartConnectingEdge,
    props.variable.id,
    props.nodeId,
    props.connectorHandlePosition,
  ]);

  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
      id: props.value.id,
      disabled: !isSortableEnabledForThisRow,
    });

  const isVariableReadOnly =
    props.isNodeReadOnly || props.variableDefinition.isVariableFixed;

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
            <NodeRenamableVariableNameInput
              readonly={isVariableReadOnly}
              value={{ name: getValues().name }}
              onChange={(value) => {
                setValue('name', value.name);
                onChange();
              }}
            />
            {props.isNodeReadOnly && !props.variable.isGlobal ? null : (
              <NodeVariableToggleIsGlobalButton
                disabled={props.isNodeReadOnly}
                isActive={getValues().isGlobal}
                onClick={() => {
                  if (!props.isNodeReadOnly) {
                    setValue('isGlobal', !getValues().isGlobal);
                    onChange();
                  }
                }}
              />
            )}
            {!isVariableReadOnly && <RemoveButton onClick={props.onRemove} />}
          </VariableConfigRow>
          {props.variable.isGlobal && (
            <NodeVariableGlobalVariableSelectorRow
              readonly={props.isNodeReadOnly}
              variableId={props.variable.id}
              value={{ globalVariableId: getValues().globalVariableId }}
              onChange={(value) => {
                setValue('globalVariableId', value.globalVariableId);
                onChange();
              }}
            />
          )}
          {props.variableDefinition.helperText && (
            <HelperTextRow>
              <NodeFieldHelperTextWithStatus>
                {props.variableDefinition.helperText()}
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

export default NodeRenamableVariableItem;
