import { FormHelperText, FormLabel, Input } from '@mui/joy';
import { useCallback } from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';

import { NodeAccountLevelTextFieldDefinition, NodeType } from 'flow-models';

import { useLocalStorageStore } from 'state-root/local-storage-state';
import { useNodeFieldFeedbackStore } from 'state-root/node-field-feedback-state';

import NodeFieldHelperTextWithStatus from './NodeFieldHelperTextWithStatus';
import NodeFieldSectionFormControl from './NodeFieldSectionFormControl';

type Props = {
  isNodeConfigReadOnly: boolean;
  nodeId: string;
  nodeType: NodeType;
  fieldKey: string;
  fieldDefinition: NodeAccountLevelTextFieldDefinition;
};

function NodeGlobalTextField(props: Props) {
  const { fieldDefinition: fd } = props;

  const getGlobalField =
    useLocalStorageStore.use.getLocalAccountLevelNodeFieldValue();
  const setGlobalField =
    useLocalStorageStore.use.setLocalAccountLevelNodeFieldValue();
  const getFieldFeedbacks = useNodeFieldFeedbackStore.use.getFieldFeedbacks();

  const globalFieldValue = getGlobalField(props.nodeType, props.fieldKey) ?? '';

  const { control, handleSubmit } = useForm<FormType>({
    values: { value: globalFieldValue },
  });

  const onSaveCallback = useCallback<SubmitHandler<FormType>>(
    (data) => {
      setGlobalField(props.nodeType, props.fieldKey, data.value);
    },
    [props.fieldKey, props.nodeType, setGlobalField],
  );

  // Global fields are hidden in the UI if we are in read-only mode
  if (props.isNodeConfigReadOnly) {
    return null;
  }

  const feedbacks = getFieldFeedbacks(props.nodeId, props.fieldKey);

  return (
    <NodeFieldSectionFormControl>
      <FormLabel>{fd.label}</FormLabel>
      <Controller
        name="value"
        control={control}
        render={({ field }) => (
          <Input
            {...field}
            type="password"
            color={feedbacks.length ? 'danger' : 'neutral'}
            placeholder={fd.placeholder}
            onBlur={() => {
              field.onBlur();
              handleSubmit(onSaveCallback)();
            }}
            onKeyUp={(event) => {
              if (event.key === 'Enter') {
                handleSubmit(onSaveCallback)();
              }
            }}
          />
        )}
      />
      {feedbacks.map((feedback, i) => (
        <NodeFieldHelperTextWithStatus key={i} color="danger">
          {feedback}
        </NodeFieldHelperTextWithStatus>
      ))}
      {fd.helperMessage && <FormHelperText>{fd.helperMessage}</FormHelperText>}
    </NodeFieldSectionFormControl>
  );
}

type FormType = {
  value: string;
};

export default NodeGlobalTextField;
