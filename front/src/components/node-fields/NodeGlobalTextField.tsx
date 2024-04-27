import { FormHelperText, FormLabel, Input } from '@mui/joy';
import { useCallback } from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';

import { NodeAccountLevelTextFieldDefinition, NodeTypeEnum } from 'flow-models';

import { useFlowStore } from 'state-flow/flow-store';
import { useLocalStorageStore } from 'state-root/local-storage-state';

import NodeFieldHelperTextWithStatus from './NodeFieldHelperTextWithStatus';
import NodeFieldSectionFormControl from './NodeFieldSectionFormControl';

type Props = {
  isNodeConfigReadOnly: boolean;
  nodeId: string;
  nodeType: NodeTypeEnum;
  fieldKey: string;
  fieldDefinition: NodeAccountLevelTextFieldDefinition;
};

function NodeGlobalTextField(props: Props) {
  const { fieldDefinition: fd } = props;

  const getGlobalField =
    useLocalStorageStore.use.getLocalAccountLevelNodeFieldValue();
  const setGlobalField =
    useLocalStorageStore.use.setLocalAccountLevelNodeFieldValue();

  const nodeAccountLevelFieldsValidationErrors = useFlowStore(
    (s) => s.getFlowContent().nodeAccountLevelFieldsValidationErrors,
  );

  const globalFieldValue = getGlobalField(props.fieldKey) ?? '';

  const { control, handleSubmit } = useForm<FormType>({
    values: { value: globalFieldValue },
  });

  const onSaveCallback = useCallback<SubmitHandler<FormType>>(
    (data) => {
      setGlobalField(props.fieldKey, data.value);
    },
    [props.fieldKey, setGlobalField],
  );

  // Global fields are hidden in the UI if we are in read-only mode
  if (props.isNodeConfigReadOnly) {
    return null;
  }

  const errorMessage = nodeAccountLevelFieldsValidationErrors[
    `${props.nodeType}:${props.fieldKey}`
  ] as string | undefined;

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
            color={errorMessage != null ? 'danger' : 'neutral'}
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
      <NodeFieldHelperTextWithStatus color="danger">
        {errorMessage}
      </NodeFieldHelperTextWithStatus>
      {fd.helperMessage && <FormHelperText>{fd.helperMessage}</FormHelperText>}
    </NodeFieldSectionFormControl>
  );
}

type FormType = {
  value: string;
};

export default NodeGlobalTextField;
