import {
  Button,
  FormControl,
  FormLabel,
  Radio,
  RadioGroup,
  Textarea,
} from '@mui/joy';
import {
  type LlmMessagesFieldDefinition,
  type NodeConfigMessagesFieldType,
} from 'flow-models';
import RemoveButton from 'generic-components/RemoveButton';
import { produce } from 'immer';
import { ChatGPTMessageRole } from 'integrations/openai';
import { useMemo } from 'react';
import {
  useController,
  useFieldArray,
  useForm,
  type Control,
} from 'react-hook-form';
import { useFlowStore } from 'state-flow/flow-store';

type Props = {
  isNodeConfigReadOnly: boolean;
  nodeId: string;
  fieldDef: LlmMessagesFieldDefinition;
  // fieldValue: string;
  // onUpdate: (value: string) => void;
};

type FieldValues = {
  value: {
    role: ChatGPTMessageRole;
    content: string;
  }[];
};

function NodeLlmMessagesField(props: Props) {
  const { fieldDef: fd } = props;

  const nodeConfig = useFlowStore(
    (s) => s.getFlowContent().nodeConfigs[props.nodeId],
  );

  const configValue = nodeConfig[
    fd.attrName as keyof typeof nodeConfig
  ] as unknown as NodeConfigMessagesFieldType;

  const { control, handleSubmit } = useForm<FieldValues>({
    values: configValue[0],
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'value' });

  const updateNodeConfig = useFlowStore((s) => s.updateNodeConfig);

  const submit = useMemo(() => {
    return handleSubmit((data) => {
      updateNodeConfig(props.nodeId, {
        [fd.attrName]: produce(configValue, (draft) => {
          draft[0].value = data.value;
        }),
      });
    });
  }, [configValue, fd.attrName, handleSubmit, props.nodeId, updateNodeConfig]);

  return (
    <div>
      <FormLabel>Messages</FormLabel>
      <div>
        <Button color="success" variant="outlined" onClick={() => {}}>
          Add variable
        </Button>
      </div>
      <div>
        <Button
          color="success"
          variant="outlined"
          onClick={() => {
            append({
              role: ChatGPTMessageRole.user,
              content: '',
            });
            submit();
          }}
        >
          Add message
        </Button>
      </div>
      {fields.map((_, index) => (
        <MessageBlock
          key={index}
          control={control}
          index={index}
          onRemove={() => {
            remove(index);
            submit();
          }}
          afterInputUpdated={submit}
        />
      ))}
    </div>
  );
}

function MessageBlock(props: {
  control: Control<FieldValues>;
  index: number;
  onRemove: () => void;
  afterInputUpdated: () => void;
}) {
  const { field: roleField } = useController({
    control: props.control,
    name: `value.${props.index}.role`,
  });

  const { field: contentField } = useController({
    control: props.control,
    name: `value.${props.index}.content`,
  });

  return (
    <div>
      <FormLabel>message [{props.index}]</FormLabel>
      <RemoveButton onClick={props.onRemove} />
      <FormControl>
        <RadioGroup
          orientation="horizontal"
          {...roleField}
          onChange={(event) => {
            roleField.onChange(event);
            props.afterInputUpdated();
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
      </FormControl>
      <FormControl>
        <Textarea
          color="neutral"
          variant="outlined"
          minRows={3}
          maxRows={5}
          {...contentField}
          // placeholder={fd.placeholder}
          onBlur={() => {
            contentField.onBlur();
            props.afterInputUpdated();
          }}
          onKeyDown={(e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
              props.afterInputUpdated();
            }
          }}
        />
      </FormControl>
    </div>
  );
}

export default NodeLlmMessagesField;
