import {
  FieldType,
  NodeConfig,
  NodeInstanceLevelFieldDefinitionUnion,
} from 'flow-models';

import { useFlowStore } from 'state-flow/context/FlowStoreContext';

import NodeCheckboxField from '../../view-flow-canvas/node-fields/NodeCheckboxField';
import NodeNumberField from '../../view-flow-canvas/node-fields/NodeNumberField';
import NodeRadioField from './NodeRadioField';
import NodeSelectField from './NodeSelectField';
import NodeStopSequenceField from './NodeStopSequenceField';
import NodeTextField from './NodeTextField';
import NodeTextareaField from './NodeTextareaField';

type Props = {
  isNodeConfigReadOnly: boolean;
  instanceLevelConfigFieldDefinitions: Record<
    string,
    NodeInstanceLevelFieldDefinitionUnion
  >;
  nodeConfig: NodeConfig;
};

function NodeBoxInstanceLevelFields(props: Props) {
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
              isNodeConfigReadOnly={props.isNodeConfigReadOnly}
              fieldKey={fieldKey}
              fieldDefinition={fd}
              fieldValue={fieldValue as string}
              onUpdate={(value) => {
                updateNodeConfig(props.nodeConfig.nodeId, {
                  [fieldKey]: value,
                });
              }}
            />
          );
        case FieldType.StopSequence:
          return (
            <NodeStopSequenceField
              key={fieldKey}
              isNodeConfigReadOnly={props.isNodeConfigReadOnly}
              fieldKey={fieldKey}
              fieldDefinition={fd}
              fieldValue={fieldValue as string[]}
              onUpdate={(value) => {
                updateNodeConfig(props.nodeConfig.nodeId, {
                  [fieldKey]: value,
                });
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
                updateNodeConfig(props.nodeConfig.nodeId, {
                  [fieldKey]: value,
                });
              }}
            />
          );
        case FieldType.Textarea:
          return (
            <NodeTextareaField
              key={fieldKey}
              isNodeConfigReadOnly={props.isNodeConfigReadOnly}
              fieldKey={fieldKey}
              fieldDefinition={fd}
              fieldValue={fieldValue as string}
              onUpdate={(value) => {
                updateNodeConfig(props.nodeConfig.nodeId, {
                  [fieldKey]: value,
                });
              }}
            />
          );
        case FieldType.Radio:
          return (
            <NodeRadioField
              key={fieldKey}
              isNodeConfigReadOnly={props.isNodeConfigReadOnly}
              fieldKey={fieldKey}
              fieldDefinition={fd}
              fieldValue={fieldValue}
              onUpdate={(value) => {
                updateNodeConfig(props.nodeConfig.nodeId, {
                  [fieldKey]: value,
                });
              }}
            />
          );
        case FieldType.Select:
          return (
            <NodeSelectField
              key={fieldKey}
              isNodeConfigReadOnly={props.isNodeConfigReadOnly}
              fieldKey={fieldKey}
              fieldDefinition={fd}
              fieldValue={fieldValue}
              onUpdate={(value) => {
                updateNodeConfig(props.nodeConfig.nodeId, {
                  [fieldKey]: value,
                });
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
                updateNodeConfig(props.nodeConfig.nodeId, {
                  [fieldKey]: value,
                });
              }}
            />
          );
        case FieldType.SpecialRendering: {
          throw new Error('Should not handle SpecialRendering case');
        }
      }
    },
  );
}

export default NodeBoxInstanceLevelFields;
