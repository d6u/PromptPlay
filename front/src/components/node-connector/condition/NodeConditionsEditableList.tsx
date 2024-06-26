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

import { ConditionConfig, ConditionFormValue } from '../types';
import NodeConditionEditableItem from './NodeConditionEditableItem';

type Props = {
  // Won't change within current session
  isListSortable?: boolean;
  showHandles?: boolean;
  // Node level
  nodeId: string;
  // Might change
  isNodeReadOnly: boolean;
  conditionConfigs: ConditionConfig[];
};

function NodeConditionsEditableList(props: Props) {
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

  const { control, handleSubmit } = useForm<ConditionFormValue>({
    values: { list: props.conditionConfigs },
  });

  // NOTE: field will contain all properties of the variable except
  // the "id" is generated by react-hook-form.
  // But in SubmitHandler, the "id" will be the id from the original
  // variable object.
  const { fields, remove, move } = useFieldArray({
    control,
    name: 'list',
  });

  const update = useCallback(() => {
    handleSubmit((data) => {
      // NOTE: We don't handle add variable here

      if (props.conditionConfigs.length === data.list.length) {
        // This is an update

        // NOTE: Elements from the first array, not existing in the
        // second array.
        const updatedVariables = A.difference(
          data.list,
          props.conditionConfigs,
        );

        for (const changedVariable of updatedVariables) {
          invariant(
            !changedVariable.isReadOnly,
            'Condition should not be readonly',
          );
          updateVariable(changedVariable.id, {
            expressionString: changedVariable.expressionString,
          });
        }
      } else {
        // This is a remove

        // NOTE: Elements from the first array, not existing in the
        // second array. Note the order of the arguments is different from
        // above.
        const removedVariables = A.difference(
          props.conditionConfigs,
          data.list,
        );

        for (const removedVariable of removedVariables) {
          invariant(
            !removedVariable.isReadOnly,
            'Variable should not be readonly',
          );
          removeVariable(removedVariable.id);
        }

        // NOTE: Removing a variable will affect edge and handle positions.
        updateNodeInternals(props.nodeId);
      }
    })();
  }, [
    props.conditionConfigs,
    props.nodeId,
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

      const oldIndex = fields.findIndex((f) => f.id === active.id);
      const newIndex = fields.findIndex((f) => f.id === over.id);

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
      props.nodeId,
      fields,
      move,
      handleSubmit,
      updateVariables,
      updateNodeInternals,
    ],
  );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={onDragEnd}
    >
      <SortableContext
        disabled={!props.isListSortable}
        items={fields}
        strategy={verticalListSortingStrategy}
      >
        <Container>
          {fields.map((field, index) => {
            const condition = props.conditionConfigs[index];

            // NOTE: This is a workaround for the case when the condition is
            // removed
            // TODO: Find a better way to handle this
            if (condition == null) {
              return null;
            }

            return (
              <NodeConditionEditableItem
                // Must use the variable ID instead of field ID,
                // because a new field ID is generated
                // when `props.variableConfigs` updates.
                // This is to prevent loss of focus when updating variable.
                key={condition.id}
                isListSortable={!!props.isListSortable}
                showHandle={!!props.showHandles}
                nodeId={props.nodeId}
                isNodeReadOnly={props.isNodeReadOnly}
                condition={condition}
                control={control}
                formField={field}
                index={index}
                onRemove={() => {
                  remove(index);
                }}
                onUpdateTrigger={update}
              />
            );
          })}
        </Container>
      </SortableContext>
    </DndContext>
  );
}

const Container = styled.div`
  margin-top: 10px;
  margin-bottom: 10px;
`;

export default NodeConditionsEditableList;
