import z from 'zod';

import randomId from 'common-utils/randomId';
import {
  ConnectorRecordsSchema,
  ConnectorResultMapSchema,
  ConnectorType,
  GlobalVariableRecordsSchema,
  ServerEdgeSchema,
  ServerNodeSchema,
  VariableValueType,
  type ConnectorTypeEnum,
  type NodeInputVariable,
  type NodeOutputVariable,
} from './base-types';
import { NodeType } from './node-definition-base-types';
import { NodeConfigRecordsSchema, type NodeConfig } from './node-definitions';

export const CanvasDataSchemaV4 = z.object({
  // NOTE: Must provide default value each field, because when creating new
  // flow the backend will create an empty {} as flowConfig.
  edges: z.array(ServerEdgeSchema).default([]),
  nodes: z.array(ServerNodeSchema).default([]),
  nodeConfigsDict: NodeConfigRecordsSchema.default({}),
  variablesDict: ConnectorRecordsSchema.default({}),
  variableValueLookUpDicts: z.array(ConnectorResultMapSchema).default([{}]),
  globalVariables: GlobalVariableRecordsSchema.default({}),
});

export type CanvasDataV4 = z.infer<typeof CanvasDataSchemaV4>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function migrateV3ToV4(data: any): any {
  if (data == null) {
    return data;
  }

  console.log('migrateV3ToV4', data);

  for (const _nodeConfig of Object.values(data.nodeConfigsDict ?? {})) {
    const nodeConfig = _nodeConfig as NodeConfig;

    if (
      nodeConfig.type !== NodeType.ConditionNode &&
      nodeConfig.type !== NodeType.OutputNode
    ) {
      const outgoingCondition = Object.values(data.variablesDict).find(
        (_connector) => {
          const connector = _connector as {
            nodeId: string;
            type: ConnectorTypeEnum;
          };

          return (
            connector.nodeId === nodeConfig.nodeId &&
            connector.type === ConnectorType.Condition
          );
        },
      );

      if (outgoingCondition == null) {
        const conditionId = `${nodeConfig.nodeId}/${randomId()}`;

        data.variablesDict[conditionId] = {
          type: ConnectorType.Condition,
          id: `${nodeConfig.nodeId}/${randomId()}`,
          index: 0,
          nodeId: nodeConfig.nodeId,
          expressionString: '',
        };
      }
    }

    if (nodeConfig.type !== NodeType.InputNode) {
      const conditionTarget = Object.values(data.variablesDict).find(
        (_connector) => {
          const connector = _connector as {
            nodeId: string;
            type: ConnectorTypeEnum;
          };

          return (
            connector.nodeId === nodeConfig.nodeId &&
            connector.type === ConnectorType.ConditionTarget
          );
        },
      );

      if (conditionTarget == null) {
        const conditionTargetId = `${nodeConfig.nodeId}/${randomId()}`;

        data.variablesDict[conditionTargetId] = {
          type: ConnectorType.ConditionTarget,
          id: `${nodeConfig.nodeId}/${randomId()}`,
          nodeId: nodeConfig.nodeId,
        };
      }
    }

    switch (nodeConfig.type) {
      case NodeType.InputNode: {
        for (const _connector of Object.values(data.variablesDict)) {
          const connector = _connector as {
            nodeId: string;
            type: ConnectorTypeEnum | 'FlowInput';
          };
          if (
            connector.nodeId === nodeConfig.nodeId &&
            connector.type === 'FlowInput'
          ) {
            connector.type = ConnectorType.NodeOutput;
            (connector as NodeOutputVariable).valueType =
              VariableValueType.String;
          }
        }
        break;
      }
      case NodeType.OutputNode: {
        for (const _connector of Object.values(data.variablesDict)) {
          const connector = _connector as {
            nodeId: string;
            type: ConnectorTypeEnum | 'FlowOutput';
          };
          if (
            connector.nodeId === nodeConfig.nodeId &&
            connector.type === 'FlowOutput'
          ) {
            connector.type = ConnectorType.NodeInput;
            (connector as NodeInputVariable).valueType = VariableValueType.Any;
          }
        }
        break;
      }
      case NodeType.ChatGPTMessageNode: {
        for (const _connector of Object.values(data.variablesDict)) {
          const connector = _connector as {
            nodeId: string;
            type: ConnectorTypeEnum;
            index: number;
          };
          if (
            connector.nodeId === nodeConfig.nodeId &&
            connector.type === ConnectorType.NodeInput
          ) {
            if (connector.index === 0) {
              (connector as NodeInputVariable).valueType =
                VariableValueType.Structured;
            } else {
              (connector as NodeInputVariable).valueType =
                VariableValueType.String;
            }
          }

          if (
            connector.nodeId === nodeConfig.nodeId &&
            connector.type === ConnectorType.NodeOutput
          ) {
            (connector as NodeOutputVariable).valueType =
              VariableValueType.Structured;
          }
        }
        break;
      }
      case NodeType.ChatGPTChatCompletionNode: {
        for (const _connector of Object.values(data.variablesDict)) {
          const connector = _connector as {
            nodeId: string;
            type: ConnectorTypeEnum;
            index: number;
          };
          if (
            connector.nodeId === nodeConfig.nodeId &&
            connector.type === ConnectorType.NodeInput
          ) {
            (connector as NodeInputVariable).valueType =
              VariableValueType.Structured;
          }

          if (
            connector.nodeId === nodeConfig.nodeId &&
            connector.type === ConnectorType.NodeOutput
          ) {
            if (connector.index === 0) {
              (connector as NodeOutputVariable).valueType =
                VariableValueType.String;
            } else {
              (connector as NodeOutputVariable).valueType =
                VariableValueType.Structured;
            }
          }
        }
        break;
      }
      case NodeType.ElevenLabs: {
        for (const _connector of Object.values(data.variablesDict)) {
          const connector = _connector as {
            nodeId: string;
            type: ConnectorTypeEnum;
          };
          if (
            connector.nodeId === nodeConfig.nodeId &&
            connector.type === ConnectorType.NodeInput
          ) {
            (connector as NodeInputVariable).valueType =
              VariableValueType.String;
          }
        }
        break;
      }
    }
  }

  return CanvasDataSchemaV4.parse(data);
}
