import { FormHelperText, FormLabel, Input } from '@mui/joy';
import { useCallback } from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';

import { TextFieldDefinition } from 'flow-models';

import ReadonlyInput from 'components/generic/ReadonlyInput';

import NodeFieldSectionFormControl from './NodeFieldSectionFormControl';

type Props = {
  isNodeConfigReadOnly: boolean;
  fieldKey: string;
  fieldDefinition: TextFieldDefinition;
  fieldValue: string;
  onUpdate: (value: string) => void;
};

function NodeTextField(props: Props) {
  const { onUpdate: propsOnUpdate, fieldDefinition: fd } = props;

  const { control, handleSubmit } = useForm<FormType>({
    values: { value: props.fieldValue },
  });

  const onSaveCallback = useCallback<SubmitHandler<FormType>>(
    (data) => {
      propsOnUpdate(data.value);
    },
    [propsOnUpdate],
  );

  return (
    <NodeFieldSectionFormControl>
      <FormLabel>{fd.label}</FormLabel>
      {props.isNodeConfigReadOnly ? (
        <ReadonlyInput value={props.fieldValue} />
      ) : (
        <Controller
          name="value"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
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
      )}
      {fd.helperText && <FormHelperText>{fd.helperText}</FormHelperText>}
    </NodeFieldSectionFormControl>
  );
}

type FormType = {
  value: string;
};

export default NodeTextField;
