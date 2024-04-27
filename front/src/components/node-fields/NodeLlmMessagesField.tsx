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
  value: {
    role: ChatGPTMessageRole;
    content: string;
  }[];
  variableIds: string[];
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

  const { field: variableIdsField } = useController({
    control,
    name: 'variableIds',
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

  const connectors = useFlowStore((s) => s.getFlowContent().connectors);

  const inputVariables = useMemo(() => {
    return selectVariables(props.nodeId, ConnectorType.NodeInput, connectors);
  }, [props.nodeId, connectors]);

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

  const addVariable = useFlowStore((s) => s.addConnector);

  return (
    <div>
      <FormLabel>Messages</FormLabel>
      <div>
        <Button
          color="success"
          variant="outlined"
          onClick={() => {
            addVariable(
              props.nodeId,
              ConnectorType.NodeInput,
              inputVariables.length,
            );
            // TODO: Append variable ID
            variableIdsField.onChange([...variableIdsField.value]);
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
