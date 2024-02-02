import { FormControl, FormLabel, Option, Select } from '@mui/joy';
import NodeBoxSection from 'canvas-react-flow/node-box/NodeBoxSection';
import { SelectFieldDefinition } from 'flow-models';
import { useEffect, useState } from 'react';

type Props = {
  fieldKey: string;
  fieldDefinition: SelectFieldDefinition;
  fieldValue: unknown;
  isNodeConfigReadOnly: boolean;
  onSave: (value: unknown) => void;
};

function NodeSelectField(props: Props) {
  const propsOnSave = props.onSave;

  const fd = props.fieldDefinition;

  const [localFieldValue, setLocalFieldValue] = useState(
    () => props.fieldValue,
  );

  useEffect(() => {
    setLocalFieldValue(props.fieldValue);
  }, [props.fieldValue]);

  return (
    <NodeBoxSection>
      <FormControl>
        <FormLabel>{fd.label}</FormLabel>
        <Select
          disabled={props.isNodeConfigReadOnly}
          value={localFieldValue}
          onChange={(_, value) => {
            setLocalFieldValue(value);
            propsOnSave(value);
          }}
        >
          {fd.options.map((option) => (
            <Option key={option.value} value={option.value}>
              {option.label}
            </Option>
          ))}
        </Select>
      </FormControl>
    </NodeBoxSection>
  );
}

export default NodeSelectField;
