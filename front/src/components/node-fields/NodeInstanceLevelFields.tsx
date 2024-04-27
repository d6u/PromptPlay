import {
  CANVAS_CONFIG_DEFINITIONS,
  FieldType,
  NodeConfig,
  NodeInstanceLevelFieldDefinitionUnion,
} from 'flow-models';

import { useFlowStore } from 'state-flow/flow-store';

import NodeCheckboxField from './NodeCheckboxField';
import NodeGlobalTextField from './NodeGlobalTextField';
import NodeNumberField from './NodeNumberField';
import NodeRadioField from './NodeRadioField';
import NodeSelectField from './NodeSelectField';
import NodeStopSequenceField from './NodeStopSequenceField';
import NodeTextField from './NodeTextField';
import NodeTextareaField from './NodeTextareaField';

type Props = {
  isNodeConfigReadOnly: boolean;
  nodeConfigFieldDefs: NodeInstanceLevelFieldDefinitionUnion[];
  nodeConfig: NodeConfig;
};

function NodeBoxInstanceLevelFields(props: Props) {
  const updateNodeConfig = useFlowStore((s) => s.updateNodeConfig);

  return props.nodeConfigFieldDefs.map((fd) => {
    const fieldValue = props.nodeConfig[
      fd.attrName as keyof typeof props.nodeConfig
    ] as unknown;

    switch (fd.type) {
      case FieldType.Text:
        return (
          <NodeTextField
            key={fd.attrName}
            isNodeConfigReadOnly={props.isNodeConfigReadOnly}
            fieldKey={fd.attrName}
            fieldDefinition={fd}
            fieldValue={fieldValue as string}
            onUpdate={(value) => {
              updateNodeConfig(props.nodeConfig.nodeId, {
                [fd.attrName]: value,
              });
            }}
          />
        );
      case FieldType.StopSequence:
        return (
          <NodeStopSequenceField
            key={fd.attrName}
            isNodeConfigReadOnly={props.isNodeConfigReadOnly}
            fieldKey={fd.attrName}
            fieldDefinition={fd}
            fieldValue={fieldValue as string[]}
            onUpdate={(value) => {
              updateNodeConfig(props.nodeConfig.nodeId, {
                [fd.attrName]: value,
              });
            }}
          />
        );
      case FieldType.Number:
        return (
          <NodeNumberField
            key={fd.attrName}
            fieldKey={fd.attrName}
            fieldDefinition={fd}
            fieldValue={fieldValue as number | null}
            isNodeConfigReadOnly={props.isNodeConfigReadOnly}
            onUpdate={(value) => {
              updateNodeConfig(props.nodeConfig.nodeId, {
                [fd.attrName]: value,
              });
            }}
          />
        );
      case FieldType.Textarea:
        return (
          <NodeTextareaField
            key={fd.attrName}
            isNodeConfigReadOnly={props.isNodeConfigReadOnly}
            fieldKey={fd.attrName}
            fieldDefinition={fd}
            fieldValue={fieldValue as string}
            onUpdate={(value) => {
              updateNodeConfig(props.nodeConfig.nodeId, {
                [fd.attrName]: value,
              });
            }}
          />
        );
      case FieldType.Radio:
        return (
          <NodeRadioField
            key={fd.attrName}
            isNodeConfigReadOnly={props.isNodeConfigReadOnly}
            fieldKey={fd.attrName}
            fieldDefinition={fd}
            fieldValue={fieldValue}
            onUpdate={(value) => {
              updateNodeConfig(props.nodeConfig.nodeId, {
                [fd.attrName]: value,
              });
            }}
          />
        );
      case FieldType.Select:
        return (
          <NodeSelectField
            key={fd.attrName}
            isNodeConfigReadOnly={props.isNodeConfigReadOnly}
            fieldKey={fd.attrName}
            fieldDefinition={fd}
            fieldValue={fieldValue}
            onUpdate={(value) => {
              updateNodeConfig(props.nodeConfig.nodeId, {
                [fd.attrName]: value,
              });
            }}
          />
        );
      case FieldType.Checkbox:
        return (
          <NodeCheckboxField
            key={fd.attrName}
            fieldKey={fd.attrName}
            fieldDefinition={fd}
            fieldValue={fieldValue}
            isNodeConfigReadOnly={props.isNodeConfigReadOnly}
            onUpdate={(value) => {
              updateNodeConfig(props.nodeConfig.nodeId, {
                [fd.attrName]: value,
              });
            }}
          />
        );
      case FieldType.SharedCavnasConfig: {
        const canvasConfig = CANVAS_CONFIG_DEFINITIONS[fd.canvasConfigKey];

        return (
          <NodeGlobalTextField
            key={fd.attrName}
            nodeId={props.nodeConfig.nodeId}
            nodeType={props.nodeConfig.type}
            fieldKey={fd.canvasConfigKey}
            fieldDefinition={canvasConfig}
            isNodeConfigReadOnly={props.isNodeConfigReadOnly}
          />
        );
      }
      case FieldType.SpecialRendering: {
        throw new Error('Should not handle SpecialRendering case');
      }
    }
  });
}

export default NodeBoxInstanceLevelFields;
