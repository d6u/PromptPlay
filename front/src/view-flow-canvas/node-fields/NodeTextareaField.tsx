import { FormControl, FormHelperText, FormLabel, Textarea } from '@mui/joy';
import { TextareaFieldDefinition } from 'flow-models';
import { useCallback, useEffect, useState } from 'react';
import NodeBoxCopyIcon from '../node-box/NodeBoxCopyIcon';
import NodeBoxLabelWithIconContainer from '../node-box/NodeBoxLabelWithIconContainer';
import NodeBoxSection from '../node-box/NodeBoxSection';
import TextareaReadonly from '../node-box/NodeBoxTextareaReadonly';

type Props = {
  fieldKey: string;
  fieldDefinition: TextareaFieldDefinition;
  fieldValue: string;
  isNodeConfigReadOnly: boolean;
  onSave: (value: string) => void;
};

function NodeTextareaField(props: Props) {
  const propsOnSave = props.onSave;
  const fd = props.fieldDefinition;

  const [localFieldValue, setLocalFieldValue] = useState<string>(
    () => props.fieldValue,
  );

  useEffect(() => {
    setLocalFieldValue(props.fieldValue);
  }, [props.fieldValue]);

  const onSaveCallback = useCallback(() => {
    propsOnSave(localFieldValue);
  }, [localFieldValue, propsOnSave]);

  return (
    <NodeBoxSection>
      <FormControl>
        <NodeBoxLabelWithIconContainer>
          <FormLabel>{fd.label}</FormLabel>
          <NodeBoxCopyIcon
            onClick={() => {
              navigator.clipboard.writeText(localFieldValue);
            }}
          />
        </NodeBoxLabelWithIconContainer>
        {props.isNodeConfigReadOnly ? (
          <TextareaReadonly value={localFieldValue} minRows={3} maxRows={5} />
        ) : (
          <Textarea
            color="neutral"
            variant="outlined"
            minRows={3}
            maxRows={5}
            placeholder={fd.placeholder}
            value={localFieldValue}
            onChange={(e) => {
              setLocalFieldValue(e.target.value);
            }}
            onKeyDown={(e) => {
              if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
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

export default NodeTextareaField;
