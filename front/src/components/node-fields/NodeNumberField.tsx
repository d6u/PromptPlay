import { FormLabel, Input } from '@mui/joy';
import { useCallback, useEffect, useState } from 'react';

import { NumberFieldDefinition } from 'flow-models';

import ReadonlyInput from 'components/generic/ReadonlyInput';
import NodeFieldSectionFormControl from './NodeFieldSectionFormControl';

type Props = {
  fieldKey: string;
  fieldDefinition: NumberFieldDefinition;
  fieldValue: number | null;
  isNodeConfigReadOnly: boolean;
  onSave: (value: number | null) => void;
};

function NodeNumberField(props: Props) {
  const propsOnSave = props.onSave;
  const fd = props.fieldDefinition;
  const transformBeforeSave =
    fd.transformBeforeSave ?? defaultTransformBeforeSave;

  const [localFieldValue, setLocalFieldValue] = useState<string>(() =>
    fieldValueToLocalValue(props.fieldValue),
  );

  useEffect(() => {
    setLocalFieldValue(fieldValueToLocalValue(props.fieldValue));
  }, [props.fieldValue]);

  const onSaveCallback = useCallback(() => {
    const newFieldValue = transformBeforeSave(localFieldValue);
    setLocalFieldValue(fieldValueToLocalValue(newFieldValue));
    propsOnSave(newFieldValue);
  }, [localFieldValue, propsOnSave, transformBeforeSave]);

  return (
    <NodeFieldSectionFormControl>
      <FormLabel>{fd.label}</FormLabel>
      {props.isNodeConfigReadOnly ? (
        <ReadonlyInput type="number" value={String(localFieldValue)} />
      ) : (
        <Input
          type="number"
          slotProps={{
            input: { min: fd.min, max: fd.max, step: fd.step },
          }}
          value={localFieldValue}
          onChange={(event) => {
            setLocalFieldValue(event.target.value);
          }}
          onKeyUp={(event) => {
            if (event.key === 'Enter') {
              onSaveCallback();
            }
          }}
          onBlur={onSaveCallback}
        />
      )}
    </NodeFieldSectionFormControl>
  );
}

/**
 * NOTE: fieldValueToLocalValue and defaultTransformBeforeSave
 * needs to be able to called subsequently and arrive at the same value.
 */

function fieldValueToLocalValue(fieldValue: number | null): string {
  return fieldValue == null ? '' : fieldValue.toString();
}

function defaultTransformBeforeSave(value: string): number | null {
  return value === '' ? null : Number(value);
}

export default NodeNumberField;
