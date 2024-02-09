import { FormLabel, Radio, RadioGroup } from '@mui/joy';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';

import { RadioFieldDefinition } from 'flow-models';

import { useCallback } from 'react';
import NodeFieldSectionFormControl from './NodeFieldSectionFormControl';

type Props = {
  isNodeConfigReadOnly: boolean;
  fieldKey: string;
  fieldDefinition: RadioFieldDefinition;
  fieldValue: unknown;
  onUpdate: (value: unknown) => void;
};

function NodeRadioField(props: Props) {
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
      <Controller
        name="value"
        control={control}
        render={({ field }) => (
          <RadioGroup
            {...field}
            orientation="horizontal"
            onChange={(event) => {
              field.onChange(event);
              handleSubmit(onSaveCallback)();
            }}
          >
            {fd.options.map((option, i) => (
              <Radio
                key={i}
                color="primary"
                name="role"
                label={option.label}
                disabled={!!props.isNodeConfigReadOnly}
                value={option.value}
              />
            ))}
          </RadioGroup>
        )}
      />
    </NodeFieldSectionFormControl>
  );
}

type FormType = {
  value: unknown;
};

export default NodeRadioField;
