import { useNodeId } from 'reactflow';

import {
  FieldType,
  NodeConfig,
  NodeID,
  NodeInstanceLevelFieldDefinitionUnion,
} from 'flow-models';

import { useFlowStore } from 'state-flow/context/FlowStoreContext';

import NodeCheckboxField from '../node-fields/NodeCheckboxField';
import NodeNumberField from '../node-fields/NodeNumberField';
import NodeRadioField from '../node-fields/NodeRadioField';
import NodeSelectField from '../node-fields/NodeSelectField';
import NodeTextField from '../node-fields/NodeTextField';
import NodeTextareaField from '../node-fields/NodeTextareaField';

type Props = {
  isNodeConfigReadOnly: boolean;
  instanceLevelConfigFieldDefinitions: Record<
    string,
    NodeInstanceLevelFieldDefinitionUnion
  >;
  nodeConfig: NodeConfig;
};

function NodeBoxInstanceLevelFields(props: Props) {
  const nodeId = useNodeId() as NodeID;

  const updateNodeConfig = useFlowStore((s) => s.updateNodeConfig);

  return Object.entries(props.instanceLevelConfigFieldDefinitions).map(
    ([fieldKey, fd]) => {
      const fieldValue = props.nodeConfig[
        fieldKey as keyof typeof props.nodeConfig
      ] as unknown;

      switch (fd.type) {
        case FieldType.Text:
          return (
            <NodeTextField
              key={fieldKey}
              fieldKey={fieldKey}
              fieldDefinition={fd}
              fieldValue={fieldValue}
              isNodeConfigReadOnly={props.isNodeConfigReadOnly}
              onSave={(value) => {
                updateNodeConfig(nodeId, { [fieldKey]: value });
              }}
            />
          );
        case FieldType.Number:
          return (
            <NodeNumberField
              key={fieldKey}
              fieldKey={fieldKey}
              fieldDefinition={fd}
              fieldValue={fieldValue as number | null}
              isNodeConfigReadOnly={props.isNodeConfigReadOnly}
              onSave={(value) => {
                updateNodeConfig(nodeId, { [fieldKey]: value });
              }}
            />
          );
        case FieldType.Textarea:
          return (
            <NodeTextareaField
              key={fieldKey}
              fieldKey={fieldKey}
              fieldDefinition={fd}
              fieldValue={fieldValue as string}
              isNodeConfigReadOnly={props.isNodeConfigReadOnly}
              onSave={(value) => {
                updateNodeConfig(nodeId, { [fieldKey]: value });
              }}
            />
          );
        case FieldType.Radio:
          return (
            <NodeRadioField
              key={fieldKey}
              fieldKey={fieldKey}
              fieldDefinition={fd}
              fieldValue={fieldValue}
              isNodeConfigReadOnly={props.isNodeConfigReadOnly}
              onSave={(value) => {
                updateNodeConfig(nodeId, { [fieldKey]: value });
              }}
            />
          );
        case FieldType.Select:
          return (
            <NodeSelectField
              key={fieldKey}
              fieldKey={fieldKey}
              fieldDefinition={fd}
              fieldValue={fieldValue}
              isNodeConfigReadOnly={props.isNodeConfigReadOnly}
              onSave={(value) => {
                updateNodeConfig(nodeId, { [fieldKey]: value });
              }}
            />
          );
        case FieldType.Checkbox:
          return (
            <NodeCheckboxField
              key={fieldKey}
              fieldKey={fieldKey}
              fieldDefinition={fd}
              fieldValue={fieldValue}
              isNodeConfigReadOnly={props.isNodeConfigReadOnly}
              onSave={(value) => {
                updateNodeConfig(nodeId, { [fieldKey]: value });
              }}
            />
          );
      }
    },
  );
}

export default NodeBoxInstanceLevelFields;
