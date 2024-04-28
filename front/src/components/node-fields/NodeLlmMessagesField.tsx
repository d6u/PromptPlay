import {
  Button,
  FormControl,
  FormLabel,
  Radio,
  RadioGroup,
  Textarea,
} from '@mui/joy';
import type {
  VariableConfig,
  VariableDefinition,
} from 'components/node-connector/types';
import NodeRenamableVariableList from 'components/node-connector/variable/NodeRenamableVariableList';
import {
  ConnectorType,
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
import { Position } from 'reactflow';
import { useFlowStore } from 'state-flow/flow-store';
import { selectVariables } from 'state-flow/util/state-utils';

type Props = {
  isNodeConfigReadOnly: boolean;
  nodeId: string;
  fieldDef: LlmMessagesFieldDefinition;
};

type FieldValues = {
  variableIds: string[];
  messages: {
    type: 'inline' | 'inputVariable';
    variableId: string | null;
    value: { role: ChatGPTMessageRole; content: string } | null;
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

  const { field: fieldVariableIds } = useController({
    control,
    name: 'variableIds',
  });

  const updateNodeConfig = useFlowStore((s) => s.updateNodeConfig);

  const submit = useMemo(() => {
    return handleSubmit((data) => {
      updateNodeConfig(props.nodeId, {
        [fd.attrName]: produce(configValue, (draft) => {
          draft[0].messages = data.messages;
        }),
      });
    });
  }, [configValue, fd.attrName, handleSubmit, props.nodeId, updateNodeConfig]);

  const connectors = useFlowStore((s) => s.getFlowContent().connectors);

  const inputVariablesForCurrentField = useMemo(() => {
    if (props.nodeId != null) {
      const variables = selectVariables(
        props.nodeId,
        ConnectorType.NodeInput,
        connectors,
      );
      return variables.filter((variable) => {
        return configValue[0].variableIds.includes(variable.id);
      });
    } else {
      return [];
    }
  }, [props.nodeId, connectors, configValue]);

  const addConnectorForNodeConfigField = useFlowStore(
    (s) => s.addConnectorForNodeConfigField,
  );

  return (
    <div>
      <FormLabel>Messages</FormLabel>
      <div>
        <Button
          color="success"
          variant="outlined"
          onClick={() => {
            addConnectorForNodeConfigField({
              nodeId: props.nodeId,
              fieldKey: fd.attrName,
              type: ConnectorType.NodeInput,
            });
            // TODO: Append variable ID
            fieldVariableIds.onChange([...fieldVariableIds.value]);
          }}
        >
          Add variable
        </Button>
      </div>
      <NodeRenamableVariableList
        showConnectorHandle={Position.Left}
        nodeId={props.nodeId}
        isNodeReadOnly={props.isNodeConfigReadOnly}
        variableConfigs={inputVariablesForCurrentField.map<VariableConfig>(
          (variable) => {
            return {
              id: variable.id,
              name: variable.name,
              isGlobal: variable.isGlobal,
              globalVariableId: variable.globalVariableId,
            };
          },
        )}
        variableDefinitions={inputVariablesForCurrentField.map<VariableDefinition>(
          () => {
            return { isVariableFixed: false };
          },
        )}
      />
      <MessagesBlock control={control} afterInputUpdated={submit} />
    </div>
  );
}

function MessagesBlock(props: {
  control: Control<FieldValues>;
  afterInputUpdated: () => void;
}) {
  const {
    fields: fieldsMessages,
    append,
    remove,
  } = useFieldArray({
    control: props.control,
    name: 'messages',
  });

  return (
    <>
      <div>
        <Button
          color="success"
          variant="outlined"
          onClick={() => {
            append({
              type: 'inline',
              variableId: null,
              value: { role: ChatGPTMessageRole.user, content: '' },
            });
            props.afterInputUpdated();
          }}
        >
          Add message
        </Button>
      </div>
      {fieldsMessages.map((_, index) => (
        <MessageBlock
          key={index}
          control={props.control}
          index={index}
          onRemove={() => {
            remove(index);
            props.afterInputUpdated();
          }}
          afterInputUpdated={props.afterInputUpdated}
        />
      ))}
    </>
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
    name: `messages.${props.index}.value.role`,
  });

  const { field: contentField } = useController({
    control: props.control,
    name: `messages.${props.index}.value.content`,
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
