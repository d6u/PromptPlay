import z from 'zod';

import randomId from 'common-utils/randomId';

import {
  ConditionResultRecordsSchema,
  ConnectorRecordsSchema,
  ConnectorType,
  GlobalVariableRecordsSchema,
  ServerEdgeSchema,
  ServerNodeSchema,
  VariableValueRecordsSchema,
  VariableValueType,
  type ConditionResultRecords,
  type ConnectorTypeEnum,
  type NodeInputVariable,
  type NodeOutputVariable,
  type VariableValueRecords,
} from './base-types';
import { NodeClass, NodeType } from './node-definition-base-types';
import { NodeConfigRecordsSchema, type NodeConfig } from './node-definitions';

export const CanvasDataV4Schema = z.object({
  // NOTE: Must provide default value each field, because when creating new
  // flow the backend will create an empty {} as flowConfig.
  edges: z.array(ServerEdgeSchema).default([]),
  nodes: z.array(ServerNodeSchema).default([]),
  nodeConfigs: NodeConfigRecordsSchema.default({}),
  connectors: ConnectorRecordsSchema.default({}),
  globalVariables: GlobalVariableRecordsSchema.default({}),
  conditionResults: ConditionResultRecordsSchema.default({}),
  variableResults: VariableValueRecordsSchema.default({}),
});

export type CanvasDataV4 = z.infer<typeof CanvasDataV4Schema>;

/**
 * @param data V3 data, will be mutated.
 * @returns V4 data
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function migrateV3ToV4(data: any): CanvasDataV4 {
  if (data == null) {
    return data;
  }

  for (const _nodeConfig of Object.values(data.nodeConfigsDict ?? {})) {
    const nodeConfig = _nodeConfig as NodeConfig;

    // Add missing node fields
    let inputNodeCount = 1;
    if (nodeConfig.type === NodeType.InputNode) {
      nodeConfig.class = NodeClass.Start;
      nodeConfig.nodeName = `input ${inputNodeCount}`;
      inputNodeCount += 1;
    } else if (nodeConfig.type === NodeType.OutputNode) {
      nodeConfig.class = NodeClass.Finish;
    } else {
      nodeConfig.class = NodeClass.Process;
    }

    // Add missing outgoing condition
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
            connector.type === ConnectorType.OutCondition
          );
        },
      );

      if (outgoingCondition == null) {
        const conditionId = `${nodeConfig.nodeId}/${randomId()}`;

        data.variablesDict[conditionId] = {
          type: ConnectorType.OutCondition,
          id: conditionId,
          index: 0,
          nodeId: nodeConfig.nodeId,
          expressionString: '',
        };
      }
    }

    // Add missing condition target
    if (nodeConfig.type !== NodeType.InputNode) {
      const conditionTarget = Object.values(data.variablesDict).find(
        (_connector) => {
          const connector = _connector as {
            nodeId: string;
            type: ConnectorTypeEnum;
          };

          return (
            connector.nodeId === nodeConfig.nodeId &&
            connector.type === ConnectorType.InCondition
          );
        },
      );

      if (conditionTarget == null) {
        const conditionTargetId = `${nodeConfig.nodeId}/${randomId()}`;

        data.variablesDict[conditionTargetId] = {
          type: ConnectorType.InCondition,
          id: conditionTargetId,
          nodeId: nodeConfig.nodeId,
        };
      }
    }

    // Migrate variable value type
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
      case NodeType.ConditionNode: {
        for (const _connector of Object.values(data.variablesDict)) {
          const connector = _connector as {
            nodeId: string;
            type: ConnectorTypeEnum;
          };
          if (
            connector.nodeId === nodeConfig.nodeId &&
            connector.type === ConnectorType.NodeInput
          ) {
            (connector as NodeInputVariable).valueType = VariableValueType.Any;
          }
        }
        break;
      }
      case NodeType.TextTemplate: {
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

          if (
            connector.nodeId === nodeConfig.nodeId &&
            connector.type === ConnectorType.NodeOutput
          ) {
            (connector as NodeOutputVariable).valueType =
              VariableValueType.String;
          }
        }
        break;
      }
      case NodeType.JavaScriptFunctionNode: {
        for (const _connector of Object.values(data.variablesDict)) {
          const connector = _connector as {
            nodeId: string;
            type: ConnectorTypeEnum;
          };
          if (
            connector.nodeId === nodeConfig.nodeId &&
            connector.type === ConnectorType.NodeInput
          ) {
            (connector as NodeInputVariable).valueType = VariableValueType.Any;
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
      case NodeType.HuggingFaceInference: {
        for (const _connector of Object.values(data.variablesDict)) {
          const connector = _connector as {
            nodeId: string;
            type: ConnectorTypeEnum;
          };
          if (
            connector.nodeId === nodeConfig.nodeId &&
            connector.type === ConnectorType.NodeInput
          ) {
            (connector as NodeInputVariable).valueType = VariableValueType.Any;
          }

          if (
            connector.nodeId === nodeConfig.nodeId &&
            connector.type === ConnectorType.NodeOutput
          ) {
            (connector as NodeInputVariable).valueType =
              VariableValueType.Structured;
          }
        }
        break;
      }
    }
  }

  const conditionResults: ConditionResultRecords = {};
  const variableResults: VariableValueRecords = {};

  for (const connectorId of Object.keys(
    (data.variableValueLookUpDicts ?? [])[0] ?? {},
  )) {
    const result = data.variableValueLookUpDicts[0][connectorId];

    if (result == null) {
      continue;
    }

    if (result.conditionId != null) {
      conditionResults[connectorId] = result;
    } else {
      variableResults[connectorId] = { value: result };
    }
  }

  const output = {
    // There is no modification to "edges" and "nodes" props
    edges: data.edges ?? [],
    nodes: data.nodes ?? [],
    // These props will be migrated to V4
    nodeConfigs: data.nodeConfigsDict ?? {},
    connectors: data.variablesDict ?? {},
    globalVariables: {},
    conditionResults: conditionResults,
    variableResults: variableResults,
  };

  return CanvasDataV4Schema.parse(output);
}
