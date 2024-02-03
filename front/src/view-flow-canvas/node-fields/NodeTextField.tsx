import { FormControl, FormHelperText, FormLabel, Input } from '@mui/joy';
import { TextFieldDefinition } from 'flow-models';
import { useCallback, useEffect, useMemo, useState } from 'react';
import NodeBoxIncomingVariableReadonly from '../node-box/NodeBoxIncomingVariableReadonly';
import NodeBoxSection from '../node-box/NodeBoxSection';

type Props = {
  fieldKey: string;
  fieldDefinition: TextFieldDefinition;
  fieldValue: unknown;
  isNodeConfigReadOnly: boolean;
  onSave: (value: unknown) => void;
};

function NodeTextField(props: Props) {
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

  const onSaveCallback = useCallback(() => {
    propsOnSave(localFieldValue);
  }, [localFieldValue, propsOnSave]);

  const renderValue = useMemo(() => {
    return transformBeforeRender(localFieldValue);
  }, [localFieldValue, transformBeforeRender]);

  return (
    <NodeBoxSection>
      <FormControl>
        <FormLabel>{fd.label}</FormLabel>
        {props.isNodeConfigReadOnly ? (
          <NodeBoxIncomingVariableReadonly value={renderValue} />
        ) : (
          <Input
            placeholder={fd.placeholder}
            value={renderValue}
            onKeyDown={(event) => {
              if (event.shiftKey && event.key === 'Enter') {
                event.preventDefault();
                setLocalFieldValue((state: string[]) => {
                  return transformBeforeSave(
                    transformBeforeRender(state) + '\n',
                  );
                });
              }
            }}
            onChange={(e) => {
              setLocalFieldValue(transformBeforeSave(e.target.value));
            }}
            onKeyUp={(e) => {
              if (e.key === 'Enter') {
                onSaveCallback();
              }
            }}
            onBlur={onSaveCallback}
          />
        )}
        {fd.helperMessage && (
          <FormHelperText>{fd.helperMessage}</FormHelperText>
        )}
      </FormControl>
    </NodeBoxSection>
  );
}

function defaultTransformBeforeRender(value: unknown): string {
  return value as string;
}

function defaultTransformBeforeSave(value: string): unknown {
  return value;
}

export default NodeTextField;
