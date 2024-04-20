import * as A from 'fp-ts/Array';
import * as S from 'fp-ts/string';
import z from 'zod';

import randomId from 'common-utils/randomId';

import { produce } from 'immer';
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

const ORPHAN_NODE_CONFIG_ERR = 'nodeConfig must have a corresponding node.';
const ORPHAN_CONNECTOR_ERR = 'Connector must have a corresponding node.';
const ORPHAN_EDGE_ERR =
  'Edge source, target, sourceHandle, and targetHandle must be valid node and connector IDs';

export function safeParseAndApplyFix(data: unknown): ReturnType<
  typeof CanvasDataV4Schema.safeParse
> & {
  originalErrors?: z.ZodIssue[];
} {
  let result = CanvasDataV4Schema.safeParse(data);

  if (result.success) {
    return result;
  }

  const originalErrors = result.error.errors;

  let hasUnfixableError = false;

  for (const error of originalErrors) {
    if (
      error.message !== ORPHAN_NODE_CONFIG_ERR &&
      error.message !== ORPHAN_CONNECTOR_ERR &&
      error.message !== ORPHAN_EDGE_ERR
    ) {
      hasUnfixableError = true;
      break;
    }
  }

  if (hasUnfixableError) {
    return result;
  }

  data = produce(data as CanvasDataV4, (draft) => {
    const orphanEdgeIndexes: number[] = [];

    for (const error of originalErrors) {
      if (error.message === ORPHAN_NODE_CONFIG_ERR) {
        delete draft.nodeConfigs[error.path[1]];
      } else if (error.message === ORPHAN_CONNECTOR_ERR) {
        delete draft.connectors[error.path[1]];
      } else if (error.message === ORPHAN_EDGE_ERR) {
        orphanEdgeIndexes.push(Number(error.path[1]));
      }
    }

    if (orphanEdgeIndexes.length > 0) {
      draft.edges = draft.edges
        .map((edge, i) => [i, edge] as const)
        .filter((pair) => !orphanEdgeIndexes.includes(pair[0]))
        .map((pair) => pair[1]);
    }
  });

  result = CanvasDataV4Schema.safeParse(data);

  return { ...result, originalErrors };
}

export const CanvasDataV4Schema = z
  .object({
    // NOTE: Must provide default value each field, because when creating new
    // flow the backend will create an empty {} as flowConfig.
    edges: z.array(ServerEdgeSchema).default([]),
    nodes: z.array(ServerNodeSchema).default([]),
    nodeConfigs: NodeConfigRecordsSchema.default({}),
    connectors: ConnectorRecordsSchema.default({}),
    globalVariables: GlobalVariableRecordsSchema.default({}),
    conditionResults: ConditionResultRecordsSchema.default({}),
    variableResults: VariableValueRecordsSchema.default({}),
  })
  .superRefine((val, ctx) => {
    const nodeIds = val.nodes.map((node) => node.id);
    const nodeConfigNodeIds = Object.keys(val.nodeConfigs);

    if (A.difference(S.Eq)(nodeIds, nodeConfigNodeIds).length > 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'There are nodes without nodeConfigs.',
        path: ['nodeConfigs'],
      });
    }

    for (const nodeId of A.difference(S.Eq)(nodeConfigNodeIds, nodeIds)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: ORPHAN_NODE_CONFIG_ERR,
        path: ['nodeConfigs', nodeId],
      });
    }

    for (const connector of Object.values(val.connectors)) {
      if (!nodeIds.includes(connector.nodeId)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: ORPHAN_CONNECTOR_ERR,
          path: ['connectors', connector.id],
        });
      }
    }

    for (const [i, edge] of val.edges.entries()) {
      if (
        val.nodeConfigs[edge.source] == null ||
        val.nodeConfigs[edge.target] == null ||
        val.connectors[edge.sourceHandle] == null ||
        val.connectors[edge.targetHandle] == null
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: ORPHAN_EDGE_ERR,
          path: ['edges', i],
        });
      }
    }
  });

export type CanvasDataV4 = z.infer<typeof CanvasDataV4Schema>;

/**
 * @param data V3 data, will be mutated.
 */
export function migrateV3ToV4(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any,
): ReturnType<typeof safeParseAndApplyFix> {
  if (data == null) {
    return data;
  }

  for (const _nodeConfig of Object.values(data.nodeConfigsDict ?? {})) {
    const nodeConfig = _nodeConfig as NodeConfig;

    // Add and update missing node fields
    let inputNodeCount = 1;
    if (nodeConfig.type === NodeType.InputNode) {
      nodeConfig.class = NodeClass.Start;
      nodeConfig.nodeName = `input ${inputNodeCount}`;
      inputNodeCount += 1;
    } else if (nodeConfig.type === NodeType.OutputNode) {
      nodeConfig.class = NodeClass.Finish;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } else if ((nodeConfig as any).type === 'ConditionNode') {
      nodeConfig.type = NodeType.JSONataCondition;
      nodeConfig.class = NodeClass.Condition;
    } else {
      nodeConfig.class = NodeClass.Process;
    }

    // Rename condition type name
    for (const connectorId of Object.keys(data.variablesDict)) {
      const connector = data.variablesDict[connectorId];
      if (connector.type === 'Condition') {
        connector.type = ConnectorType.OutCondition;
      } else if (connector.type === 'ConditionTarget') {
        connector.type = ConnectorType.InCondition;
      }
    }

    // Add missing outgoing condition
    if (
      nodeConfig.type !== NodeType.JSONataCondition &&
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

    // Add missing incoming condition
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
      case NodeType.JSONataCondition: {
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

  return safeParseAndApplyFix(output);
}
