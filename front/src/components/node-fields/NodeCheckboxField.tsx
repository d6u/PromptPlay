import { Checkbox, FormLabel } from '@mui/joy';
import { useCallback } from 'react';

import { CheckboxFieldDefinition } from 'flow-models';

import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import NodeFieldSectionFormControl from './NodeFieldSectionFormControl';

type Props = {
  isNodeConfigReadOnly: boolean;
  fieldKey: string;
  fieldDefinition: CheckboxFieldDefinition;
  fieldValue: unknown;
  onUpdate: (value: unknown) => void;
};

function NodeCheckboxField(props: Props) {
  const { onUpdate: propsOnUpdate, fieldDefinition: fd } = props;

  const render = fd.render ?? defaultRender;
  const parse = fd.parse ?? defaultParse;

  const { control, handleSubmit } = useForm<FormType>({
    values: { value: render(props.fieldValue) },
  });

  const onSaveCallback = useCallback<SubmitHandler<FormType>>(
    (data) => {
      propsOnUpdate(parse(data.value));
    },
    [parse, propsOnUpdate],
  );

  return (
    <NodeFieldSectionFormControl>
      <FormLabel>{fd.label}</FormLabel>
      <Controller
        name="value"
        control={control}
        render={({ field }) => (
          <Checkbox
            {...field}
            value={undefined}
            disabled={props.isNodeConfigReadOnly}
            size="sm"
            variant="outlined"
            checked={field.value}
            onChange={(event) => {
              field.onChange(event);
              handleSubmit(onSaveCallback)();
            }}
          />
        )}
      />
    </NodeFieldSectionFormControl>
  );
}

type FormType = {
  value: boolean;
};

function defaultRender(value: unknown): boolean {
  return value as boolean;
}

function defaultParse(value: boolean): unknown {
  return value;
}

export default NodeCheckboxField;
