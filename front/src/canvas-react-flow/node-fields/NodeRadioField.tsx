import { FormControl, FormLabel, Radio, RadioGroup } from '@mui/joy';
import NodeBoxSection from 'canvas-react-flow/node-box/NodeBoxSection';
import { RadioFieldDefinition } from 'flow-models';
import { useEffect, useState } from 'react';

type Props = {
  fieldKey: string;
  fieldDefinition: RadioFieldDefinition;
  fieldValue: unknown;
  isNodeConfigReadOnly: boolean;
  onSave: (value: unknown) => void;
};

function NodeRadioField(props: Props) {
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
        <RadioGroup
          orientation="horizontal"
          value={localFieldValue as string}
          onChange={(e) => {
            const newFieldValue = e.target.value;
            setLocalFieldValue(newFieldValue);
            propsOnSave(newFieldValue);
          }}
        >
          {fd.options.map((option, i) => {
            return (
              <Radio
                key={i}
                color="primary"
                name="role"
                label={option.label}
                disabled={!!props.isNodeConfigReadOnly}
                value={option.value}
              />
            );
          })}
        </RadioGroup>
      </FormControl>
    </NodeBoxSection>
  );
}

export default NodeRadioField;
