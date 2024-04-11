import { FormLabel, Option, Select } from '@mui/joy';
import { useCallback, useMemo } from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';

import { SelectFieldDefinition, type FieldOption } from 'flow-models';

import NodeFieldSectionFormControl from 'components/node-fields/NodeFieldSectionFormControl';
import { useFlowStore } from 'state-flow/flow-store';

type Props = {
  isNodeConfigReadOnly: boolean;
  fieldKey: string;
  fieldDefinition: SelectFieldDefinition;
  fieldValue: unknown;
  onUpdate: (value: unknown) => void;
};

function NodeSelectField(props: Props) {
  const { onUpdate: propsOnUpdate, fieldDefinition: fd } = props;

  const nodeConfigs = useFlowStore((s) => s.getFlowContent().nodeConfigs);

  const { control, handleSubmit } = useForm<FormType>({
    values: { value: props.fieldValue },
  });

  const onSaveCallback = useCallback<SubmitHandler<FormType>>(
    (data) => {
      propsOnUpdate(data.value);
    },
    [propsOnUpdate],
  );

  const options = useMemo(() => {
    let options: FieldOption[] = [];

    if ('options' in fd) {
      options = fd.options;
    } else {
      options = fd.dynamicOptions(nodeConfigs);
    }

    if (options.length === 0) {
      return [
        <Option key="no-option" value="" disabled>
          No Loop Start node available
        </Option>,
      ];
    }

    return options.map((option) => (
      <Option key={option.value} value={option.value}>
        {option.label}
      </Option>
    ));
  }, [fd, nodeConfigs]);

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
            placeholder="Select an Loop Start node"
            onChange={(_, value) => {
              field.onChange(value);
              handleSubmit(onSaveCallback)();
            }}
          >
            {options}
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
