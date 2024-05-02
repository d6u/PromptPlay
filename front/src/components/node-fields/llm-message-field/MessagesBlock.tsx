import { css } from '@emotion/react';
import { Button } from '@mui/joy';
import { ChatGPTMessageRole } from 'integrations/openai';
import { useMemo } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import MessageBlock from './MessageBlock';
import { FieldValues } from './types';

function MessagesBlock(props: {
  readonly: boolean;
  nodeId: string;
  value: Pick<FieldValues, 'messages'>;
  onChange: (value: Pick<FieldValues, 'messages'>) => void;
}) {
  const { control, handleSubmit, setValue } = useForm<
    Pick<FieldValues, 'messages'>
  >({ values: props.value });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'messages',
  });

  const onChange = useMemo(() => {
    return handleSubmit(props.onChange);
  }, [handleSubmit, props]);

  return (
    <>
      {fields.map((field, index) => {
        return (
          <MessageBlock
            key={index}
            readonly={props.readonly}
            nodeId={props.nodeId}
            value={field}
            onChange={(value) => {
              setValue(`messages.${index}`, value);
              onChange();
            }}
            onRemove={() => {
              remove(index);
              onChange();
            }}
          />
        );
      })}
      <div
        css={css`
          margin-top: 5px;
        `}
      >
        <Button
          color="success"
          variant="outlined"
          onClick={() => {
            append({
              type: 'inline',
              variableId: null,
              value: { role: ChatGPTMessageRole.user, content: '' },
            });
            onChange();
          }}
        >
          Append message
        </Button>
      </div>
    </>
  );
}

export default MessagesBlock;
