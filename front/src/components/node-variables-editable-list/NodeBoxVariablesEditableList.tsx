import styled from '@emotion/styled';
import { A } from '@mobily/ts-belt';
import { useCallback } from 'react';
import { SubmitHandler, useFieldArray, useForm } from 'react-hook-form';
import { useNodeId, useUpdateNodeInternals } from 'reactflow';
import invariant from 'tiny-invariant';

import { ConnectorID, NodeID } from 'flow-models';

import { useFlowStore } from 'state-flow/context/FlowStoreContext';

import NodeBoxVariableEditableItem from './NodeBoxVariableEditableItem';
import { FormValue, VariableConfig } from './types';

type Props = {
  variables: VariableConfig[];
  onRowHeightChange?: (index: number, height: number) => void;
};

function NodeBoxVariablesEditableList(props: Props) {
  const nodeId = useNodeId() as NodeID;
  const updateNodeInternals = useUpdateNodeInternals();

  const updateVariable = useFlowStore((s) => s.updateVariable);
  const removeVariable = useFlowStore((s) => s.removeVariable);

  const { control, handleSubmit } = useForm<FormValue>({
    values: {
      variables: props.variables,
    },
  });

  const { fields, remove } = useFieldArray({
    control,
    name: 'variables',
  });

  const updateVariables = useCallback<SubmitHandler<FormValue>>(
    (data) => {
      // NOTE: We don't handle add variable here

      if (props.variables.length === data.variables.length) {
        // This is an update

        // NOTE: Elements from the first array, not existing in the
        // second array.
        const updatedVariables = A.difference(data.variables, props.variables);

        for (const changedVariable of updatedVariables) {
          invariant(
            !changedVariable.isReadOnly,
            'Variable should not be readonly',
          );
          updateVariable(changedVariable.id as ConnectorID, {
            name: changedVariable.name,
          });
        }
      } else {
        // This is a remove

        // NOTE: Elements from the first array, not existing in the
        // second array. Note the order of the arguments is different from
        // above.
        const removedVariables = A.difference(props.variables, data.variables);

        for (const removedVariable of removedVariables) {
          invariant(
            !removedVariable.isReadOnly,
            'Variable should not be readonly',
          );
          removeVariable(removedVariable.id as ConnectorID);
        }

        // NOTE: Removing a variable will affect edge and handle positions.
        updateNodeInternals(nodeId);
      }
    },
    [
      props.variables,
      nodeId,
      removeVariable,
      updateNodeInternals,
      updateVariable,
    ],
  );

  return (
    <Container>
      {fields.map((field, index) => {
        const variable = props.variables[index];
        return (
          <NodeBoxVariableEditableItem
            key={field.id}
            control={control}
            field={field}
            index={index}
            isReadOnly={variable.isReadOnly}
            helperText={variable.helperMessage}
            onConfirmNameChange={() => {
              handleSubmit(updateVariables)();
            }}
            onRemove={() => {
              remove(index);
              handleSubmit(updateVariables)();
            }}
            onHeightChange={(height) => {
              props.onRowHeightChange?.(index, height);
            }}
          />
        );
      })}
    </Container>
  );
}

const Container = styled.div`
  // padding-left: 10px;
  // padding-right: 10px;
  margin-bottom: 10px;
`;

export default NodeBoxVariablesEditableList;
