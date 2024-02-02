import { Checkbox, FormControl, FormLabel } from '@mui/joy';
import NodeBoxSection from 'canvas-react-flow/node-box/NodeBoxSection';
import { CheckboxFieldDefinition } from 'flow-models';
import {
  ChangeEventHandler,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

type Props = {
  fieldKey: string;
  fieldDefinition: CheckboxFieldDefinition;
  fieldValue: unknown;
  isNodeConfigReadOnly: boolean;
  onSave: (value: unknown) => void;
};

function NodeCheckboxField(props: Props) {
  const propsOnSave = props.onSave;

  const fd = props.fieldDefinition;

  const transformBeforeRender =
    fd.transformBeforeRender ?? defaultTransformBeforeRender;
  const transformBeforeSave =
    fd.transformBeforeSave ?? defaultTransformBeforeSave;

  const [localFieldValue, setLocalFieldValue] = useState<unknown>(
    () => props.fieldValue,
  );

  useEffect(() => {
    setLocalFieldValue(props.fieldValue);
  }, [props.fieldValue]);

  const onSaveCallback = useCallback<ChangeEventHandler<HTMLInputElement>>(
    (event) => {
      if (props.isNodeConfigReadOnly) {
        return;
      }

      const newValue = transformBeforeSave(event.target.checked);
      setLocalFieldValue(newValue);
      propsOnSave(newValue);
    },
    [props.isNodeConfigReadOnly, propsOnSave, transformBeforeSave],
  );

  const renderValue = useMemo(() => {
    return transformBeforeRender(localFieldValue);
  }, [localFieldValue, transformBeforeRender]);

  return (
    <NodeBoxSection>
      <FormControl>
        <FormLabel>{fd.label}</FormLabel>
        <Checkbox
          disabled={props.isNodeConfigReadOnly}
          size="sm"
          variant="outlined"
          checked={renderValue}
          onChange={onSaveCallback}
        />
      </FormControl>
    </NodeBoxSection>
  );
}

function defaultTransformBeforeRender(value: unknown): boolean {
  return value as boolean;
}

function defaultTransformBeforeSave(value: boolean): unknown {
  return value;
}

export default NodeCheckboxField;
