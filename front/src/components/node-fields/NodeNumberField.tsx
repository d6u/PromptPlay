import { ErrorMessage } from '@hookform/error-message';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormLabel, Input } from '@mui/joy';
import { useCallback } from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import z from 'zod';

import { NumberFieldDefinition } from 'flow-models';

import ReadonlyInput from 'generic-components/ReadonlyInput';

import NodeFieldHelperTextWithStatus from './NodeFieldHelperTextWithStatus';
import NodeFieldSectionFormControl from './NodeFieldSectionFormControl';

type Props = {
  isNodeConfigReadOnly: boolean;
  fieldKey: string;
  fieldDefinition: NumberFieldDefinition;
  fieldValue: unknown;
  onUpdate: (value: unknown) => void;
};

function NodeNumberField(props: Props) {
  const { onUpdate: propsOnUpdate, fieldDefinition: fd } = props;

  const render = fd.render ?? defaultRender;
  const parse = fd.parse ?? defaultParse;

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormType>({
    values: { value: render(props.fieldValue) },
    resolver:
      fd.schema != null
        ? zodResolver(z.object({ value: fd.schema }))
        : undefined,
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
      {props.isNodeConfigReadOnly ? (
        <ReadonlyInput
          type="number"
          value={render(props.fieldValue) ?? undefined}
        />
      ) : (
        <Controller
          name="value"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              type="number"
              slotProps={{
                input: { min: fd.min, max: fd.max, step: fd.step },
              }}
              value={field.value != null ? String(field.value) : ''}
              onChange={(event) => {
                field.onChange(
                  event.target.value !== '' ? Number(event.target.value) : null,
                );
              }}
              onKeyUp={(event) => {
                if (event.key === 'Enter') {
                  handleSubmit(onSaveCallback)();
                }
              }}
              onBlur={() => {
                field.onBlur();
                handleSubmit(onSaveCallback)();
              }}
            />
          )}
        />
      )}
      <ErrorMessage
        errors={errors}
        name="value"
        render={({ message }) => (
          <NodeFieldHelperTextWithStatus color="danger">
            {message}
          </NodeFieldHelperTextWithStatus>
        )}
      />
    </NodeFieldSectionFormControl>
  );
}

type FormType = {
  value: number | null;
};

// NOTE: By default we assume the input is number | null

function defaultRender(fieldValue: unknown): number | null {
  return fieldValue as number;
}

function defaultParse(value: number | null): unknown {
  return value;
}

export default NodeNumberField;
