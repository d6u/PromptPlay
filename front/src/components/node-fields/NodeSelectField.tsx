import { FormLabel, Option, Select } from '@mui/joy';
import { useCallback } from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';

import { SelectFieldDefinition } from 'flow-models';

import NodeFieldSectionFormControl from 'components/node-fields/NodeFieldSectionFormControl';

type Props = {
  isNodeConfigReadOnly: boolean;
  fieldKey: string;
  fieldDefinition: SelectFieldDefinition;
  fieldValue: unknown;
  onUpdate: (value: unknown) => void;
};

function NodeSelectField(props: Props) {
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
          <Select
            {...field}
            disabled={props.isNodeConfigReadOnly}
            onChange={(_, value) => {
              field.onChange(value);
              handleSubmit(onSaveCallback)();
            }}
          >
            {fd.options.map((option) => (
              <Option key={option.value} value={option.value}>
                {option.label}
              </Option>
            ))}
          </Select>
        )}
      />
    </NodeFieldSectionFormControl>
  );
}

type FormType = {
  value: unknown;
};

export default NodeSelectField;
