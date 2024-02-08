import { FormHelperText, FormLabel, Input } from '@mui/joy';
import { useCallback } from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';

import { StopSequenceFieldDefinition } from 'flow-models';
import { NEW_LINE_SYMBOL } from 'integrations/openai';

import ReadonlyInput from 'components/generic/ReadonlyInput';

import NodeFieldSectionFormControl from './NodeFieldSectionFormControl';

type FormType = {
  value: string;
};

type Props = {
  isNodeConfigReadOnly: boolean;
  fieldKey: string;
  fieldDefinition: StopSequenceFieldDefinition;
  fieldValue: string[];
  onUpdate: (value: string[]) => void;
};

function NodeStopSequenceField(props: Props) {
  const { onUpdate: propsOnUpdate, fieldDefinition: fd } = props;

  const localValue = props.fieldValue[0] ?? '';

  const { control, handleSubmit, setValue, getValues } = useForm<FormType>({
    values: { value: localValue },
  });

  const onSaveCallback = useCallback<SubmitHandler<FormType>>(
    (data) => {
      propsOnUpdate(data.value === '' ? [] : [data.value]);
    },
    [propsOnUpdate],
  );

  return (
    <NodeFieldSectionFormControl>
      <FormLabel>{fd.label}</FormLabel>
      {props.isNodeConfigReadOnly ? (
        <ReadonlyInput value={localValue} />
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
              onKeyDown={(event) => {
                if (event.shiftKey && event.key === 'Enter') {
                  event.preventDefault();
                  setValue('value', getValues().value + NEW_LINE_SYMBOL);
                }
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
      <FormHelperText>
        <span>
          Use <code>SHIFT</code> + <code>ENTER</code> to enter a new line
          character. (Visually represented by <code>"{NEW_LINE_SYMBOL}"</code>
          .)
        </span>
      </FormHelperText>
      {fd.helperText && <FormHelperText>{fd.helperText}</FormHelperText>}
    </NodeFieldSectionFormControl>
  );
}

export default NodeStopSequenceField;
