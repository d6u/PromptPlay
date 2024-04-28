import { Button, FormControl, Radio, RadioGroup, Textarea } from '@mui/joy';
import RemoveButton from 'generic-components/RemoveButton';
import { ChatGPTMessageRole } from 'integrations/openai';
import { useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { FieldValues } from './types';

function MessageBlock(props: {
  readonly: boolean;
  nodeId: string;
  value: FieldValues['messages'][number];
  onChange: (value: FieldValues['messages'][number]) => void;
  onRemove: () => void;
}) {
  const { control, register, setValue, getValues, handleSubmit } = useForm<
    FieldValues['messages'][number]
  >({ values: props.value });

  const onChange = useMemo(() => {
    return handleSubmit(props.onChange);
  }, [handleSubmit, props]);

  // const variableConfig = useMemo(() => {
  //   return {
  //     id: getValues().variableId!,
  //     name: '',
  //     isGlobal: false,
  //     globalVariableId: '',
  //   };
  // }, [getValues]);

  return (
    <div>
      <RemoveButton onClick={props.onRemove} />
      <Button
        variant="outlined"
        onClick={() => {
          const newType =
            getValues().type === 'inline' ? 'inputVariable' : 'inline';
          setValue('type', newType);
          onChange();
        }}
      >
        Toggle variable
      </Button>
      {
        getValues().type === 'inline' ? (
          <>
            <FormControl>
              <Controller
                control={control}
                name="value.role"
                render={({ field }) => (
                  <RadioGroup
                    orientation="horizontal"
                    {...field}
                    onChange={(event) => {
                      field.onChange(event);
                      onChange();
                    }}
                  >
                    {[
                      ChatGPTMessageRole.system,
                      ChatGPTMessageRole.user,
                      ChatGPTMessageRole.assistant,
                    ].map((option, i) => (
                      <Radio
                        key={i}
                        color="primary"
                        name="role"
                        label={option}
                        // disabled={!!props.isNodeConfigReadOnly}
                        value={option}
                      />
                    ))}
                  </RadioGroup>
                )}
              />
            </FormControl>
            <FormControl>
              <Textarea
                color="neutral"
                variant="outlined"
                minRows={3}
                maxRows={5}
                {...register('value.content', { onBlur: onChange })}
                // placeholder={fd.placeholder}
                onKeyDown={(e) => {
                  if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                    onChange();
                  }
                }}
              />
            </FormControl>
          </>
        ) : null
        // <NodeRenamableVariableItem
        //   connectorHandlePosition={Position.Left}
        //   isListSortable={false}
        //   nodeId={props.nodeId}
        //   isNodeReadOnly={props.readonly}
        //   variable={variableConfig}
        //   variableDefinition={props.variableDefinitions[index]}
        //   value={variableConfig}
        //   onChange={(value) => {
        //     // setValue(`list.${index}`, value);
        //     // submit();
        //   }}
        //   onRemove={props.onRemove}
        // />
      }
    </div>
  );
}

export default MessageBlock;
