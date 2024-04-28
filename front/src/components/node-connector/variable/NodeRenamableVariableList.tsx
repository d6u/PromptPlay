import {
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import styled from '@emotion/styled';
import { A } from '@mobily/ts-belt';
import { useCallback } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { useUpdateNodeInternals } from 'reactflow';
import invariant from 'tiny-invariant';

import { useFlowStore } from 'state-flow/flow-store';

import {
  VariableConfig,
  VariableFormValue,
  type VariableDefinition,
} from '../types';
import NodeRenamableVariableItem, {
  HandlePosition,
} from './NodeRenamableVariableItem';

type Props = {
  // Depend on rendering location
  isListSortable?: boolean;
  showConnectorHandle?: HandlePosition;
  // Node level
  nodeId: string;
  isNodeReadOnly: boolean;
  variableConfigs: VariableConfig[];
  variableDefinitions: VariableDefinition[];
};

function NodeRenamableVariableList(props: Props) {
  const updateNodeInternals = useUpdateNodeInternals();

  const updateVariable = useFlowStore((s) => s.updateConnector);
  const updateVariables = useFlowStore((s) => s.updateConnectors);
  const removeVariable = useFlowStore((s) => s.removeVariable);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const { control, getValues, setValue, handleSubmit } =
    useForm<VariableFormValue>({ values: { list: props.variableConfigs } });

  // NOTE: field will contain all properties of the variable except
  // the "id" is generated by react-hook-form.
  // But in SubmitHandler, the "id" will be the id from the original
  // variable object.
  const { remove, move } = useFieldArray({ control, name: 'list' });

  const submit = useCallback(() => {
    handleSubmit((data) => {
      // NOTE: We don't handle add variable here

      if (props.variableConfigs.length === data.list.length) {
        // This is an update

        // NOTE: Elements from the first array, not existing in the
        // second array.
        const updatedVariables = A.difference(data.list, props.variableConfigs);

        for (const changedVariable of updatedVariables) {
          invariant(!props.isNodeReadOnly, 'Node should not be readonly');

          const index = data.list.indexOf(changedVariable);
          const prevVariable = props.variableConfigs[index];
          const variableDefinition = props.variableDefinitions[index];

          if (prevVariable.name !== changedVariable.name) {
            // If variable name has changed, make sure it's not readonly
            invariant(
              !variableDefinition.isVariableFixed,
              'Variable should not be readonly',
            );
          }

          updateVariable(changedVariable.id, {
            name: changedVariable.name,
            isGlobal: changedVariable.isGlobal,
            globalVariableId: changedVariable.globalVariableId,
          });
        }
      } else {
        // This is a remove

        // NOTE: Elements from the first array, not existing in the
        // second array. Note the order of the arguments is different from
        // above.
        const removedVariables = A.difference(props.variableConfigs, data.list);

        for (const removedVariable of removedVariables) {
          invariant(!props.isNodeReadOnly, 'Node should not be readonly');

          const index = props.variableConfigs.indexOf(removedVariable);
          const variableDefinition = props.variableDefinitions[index];

          invariant(
            !variableDefinition.isVariableFixed,
            'Variable should not be readonly',
          );
          removeVariable(removedVariable.id);
        }

        // NOTE: Removing a variable will affect edge and handle positions.
        updateNodeInternals(props.nodeId);
      }
    })();
  }, [
    props.variableConfigs,
    props.variableDefinitions,
    props.nodeId,
    props.isNodeReadOnly,
    handleSubmit,
    updateVariable,
    updateNodeInternals,
    removeVariable,
  ]);

  const onDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;

      if (over == null || active.id === over.id) {
        return;
      }

      const elements = getValues().list;

      const oldIndex = elements.findIndex((f) => f.id === active.id);
      const newIndex = elements.findIndex((f) => f.id === over.id);

      move(oldIndex, newIndex);

      handleSubmit((data) => {
        updateVariables([
          {
            variableId: data.list[oldIndex].id,
            change: {
              // Which index to use for which variable is not important here
              // since data will contain variables in updated order.
              index: oldIndex,
            },
          },
          {
            variableId: data.list[newIndex].id,
            change: {
              index: newIndex,
            },
          },
        ]);

        // NOTE: Removing a variable will affect edge and handle positions.
        updateNodeInternals(props.nodeId);
      })();
    },
    [
      getValues,
      move,
      handleSubmit,
      updateVariables,
      updateNodeInternals,
      props.nodeId,
    ],
  );

  let editableItemStart = props.variableDefinitions.findIndex(
    (c) => !c.isVariableFixed,
  );
  if (editableItemStart === -1) {
    editableItemStart = props.variableConfigs.length;
  }

  const nonEditableFields = getValues().list.slice(0, editableItemStart);

  return (
    <Container>
      {nonEditableFields.length > 0 && (
        <div>
          {nonEditableFields.map((field, index) => {
            const variable = getValues().list[index];

            // TODO: Find a way to avoid duplicating the mapper
            return (
              <NodeRenamableVariableItem
                key={variable.id}
                connectorHandlePosition={props.showConnectorHandle ?? 'none'}
                isListSortable={false}
                nodeId={props.nodeId}
                isNodeReadOnly={props.isNodeReadOnly}
                variable={variable}
                variableDefinition={props.variableDefinitions[index]}
                value={variable}
                onChange={(value) => {
                  setValue(`list.${index}`, value);
                  submit();
                }}
                onRemove={() => {
                  remove(index);
                  submit();
                }}
              />
            );
          })}
        </div>
      )}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={onDragEnd}
      >
        <SortableContext
          disabled={!props.isListSortable}
          items={getValues().list}
          strategy={verticalListSortingStrategy}
        >
          <div>
            {getValues()
              .list.slice(editableItemStart)
              .map((field, index) => {
                index += editableItemStart;

                const variable = getValues().list[index];

                // NOTE: This is a workaround for the case when the variable is
                // removed
                // TODO: Find a better way to handle this
                if (variable == null) {
                  return null;
                }

                return (
                  <NodeRenamableVariableItem
                    // Must use the variable ID instead of field ID,
                    // because a new field ID is generated
                    // when `props.variableConfigs` updates.
                    // This is to prevent loss of focus when updating variable.
                    key={variable.id}
                    isListSortable={!!props.isListSortable}
                    connectorHandlePosition={
                      props.showConnectorHandle ?? 'none'
                    }
                    nodeId={props.nodeId}
                    isNodeReadOnly={props.isNodeReadOnly}
                    variable={variable}
                    variableDefinition={props.variableDefinitions[index]}
                    value={variable}
                    onChange={(value) => {
                      setValue(`list.${index}`, value);
                      submit();
                    }}
                    onRemove={() => {
                      remove(index);
                      submit();
                    }}
                  />
                );
              })}
          </div>
        </SortableContext>
      </DndContext>
    </Container>
  );
}

const Container = styled.div`
  position: relative;
  margin-bottom: 10px;
`;

export default NodeRenamableVariableList;
