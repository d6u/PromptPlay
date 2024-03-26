import { FormHelperText, FormLabel, Textarea } from '@mui/joy';
import { useCallback } from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';

import { TextareaFieldDefinition } from 'flow-models';

import CopyIconButton from 'generic-components/CopyIconButton';
import ReadonlyTextarea from 'generic-components/ReadonlyTextarea';

import NodeFieldLabelWithIconContainer from './NodeFieldLabelWithIconContainer';
import NodeFieldSectionFormControl from './NodeFieldSectionFormControl';

type Props = {
  isNodeConfigReadOnly: boolean;
  fieldKey: string;
  fieldDefinition: TextareaFieldDefinition;
  fieldValue: string;
  onUpdate: (value: string) => void;
};

function NodeTextareaField(props: Props) {
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
      <NodeFieldLabelWithIconContainer>
        <FormLabel>{fd.label}</FormLabel>
        <CopyIconButton
          onClick={() => {
            navigator.clipboard.writeText(props.fieldValue);
          }}
        />
      </NodeFieldLabelWithIconContainer>
      {props.isNodeConfigReadOnly ? (
        <ReadonlyTextarea value={props.fieldValue} minRows={3} maxRows={5} />
      ) : (
        <Controller
          name="value"
          control={control}
          render={({ field }) => (
            <Textarea
              {...field}
              color="neutral"
              variant="outlined"
              minRows={3}
              maxRows={5}
              placeholder={fd.placeholder}
              onBlur={() => {
                field.onBlur();
                handleSubmit(onSaveCallback)();
              }}
              onKeyDown={(e) => {
                if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                  handleSubmit(onSaveCallback)();
                }
              }}
            />
          )}
        />
      )}
      {fd.helperText && <FormHelperText>{fd.helperText()}</FormHelperText>}
    </NodeFieldSectionFormControl>
  );
}

type FormType = {
  value: string;
};

export default NodeTextareaField;
