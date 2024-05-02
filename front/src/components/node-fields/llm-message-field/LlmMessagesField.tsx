import { FormLabel } from '@mui/joy';
import NodeRenamableVariableList from 'components/node-connector/variable/NodeRenamableVariableList';
import {
  ConnectorType,
  type LlmMessagesFieldDefinition,
  type NodeConfigMessagesFieldType,
} from 'flow-models';
import { produce } from 'immer';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useFlowStore } from 'state-flow/flow-store';
import MessagesBlock from './MessagesBlock';
import { FieldValues } from './types';

type Props = {
  isNodeConfigReadOnly: boolean;
  nodeId: string;
  fieldDef: LlmMessagesFieldDefinition;
};

function NodeLlmMessagesField(props: Props) {
  const { fieldDef: fd } = props;

  const nodeConfig = useFlowStore(
    (s) => s.getFlowContent().nodeConfigs[props.nodeId],
  );

  const configValue = nodeConfig[
    fd.attrName as keyof typeof nodeConfig
  ] as unknown as NodeConfigMessagesFieldType;

  const { setValue, handleSubmit } = useForm<FieldValues>({
    values: configValue[0],
  });

  const updateNodeConfig = useFlowStore((s) => s.updateNodeConfig);

  const submit = useMemo(() => {
    return handleSubmit((data) => {
      console.log('submit', data);
      updateNodeConfig(props.nodeId, {
        [fd.attrName]: produce(configValue, (draft) => {
          draft[0].messages = data.messages;
        }),
      });
    });
  }, [configValue, fd.attrName, handleSubmit, props.nodeId, updateNodeConfig]);

  const addConnectorForNodeConfigField = useFlowStore(
    (s) => s.addConnectorForNodeConfigField,
  );

  return (
    <div>
      <FormLabel>Messages</FormLabel>
      <NodeRenamableVariableList
        nodeId={props.nodeId}
        variableIds={configValue[0].variableIds}
        onVariableIdsChange={(value) => {
          updateNodeConfig(props.nodeId, {
            [fd.attrName]: produce(configValue, (draft) => {
              draft[0].variableIds = value;
            }),
          });
        }}
        labelForAddVariableButton={`Add variable for ${fd.attrName}`}
        onAddVariable={() => {
          addConnectorForNodeConfigField({
            nodeId: props.nodeId,
            type: ConnectorType.NodeInput,
            fieldKey: fd.attrName,
            fieldIndex: 0,
          });
        }}
        isListSortable
      />
      <MessagesBlock
        readonly={props.isNodeConfigReadOnly}
        nodeId={props.nodeId}
        value={configValue[0]}
        onChange={(value) => {
          setValue('messages', value.messages);
          submit();
        }}
      />
    </div>
  );
}

export default NodeLlmMessagesField;
