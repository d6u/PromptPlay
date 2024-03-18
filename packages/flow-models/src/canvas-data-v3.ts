import { D } from '@mobily/ts-belt';
import z from 'zod';

import randomId from 'common-utils/randomId';

import type { ConditionTarget } from './base-types';
import {
  ConnectorRecordsSchema,
  ConnectorResultMapSchema,
  ConnectorType,
  GlobalVariableRecordsSchema,
  ServerEdgeSchema,
  ServerNodeSchema,
} from './base-types';
import { NodeType } from './node-definition-base-types';
import { NodeConfigRecordsSchema } from './node-definitions';

export const CanvasDataSchemaV3 = z
  .object({
    // NOTE: Must provide default value each field, because when creating new
    // flow the backend will create an empty {} as flowConfig.
    edges: z.array(ServerEdgeSchema).default([]),
    nodes: z.array(ServerNodeSchema).default([]),
    nodeConfigsDict: NodeConfigRecordsSchema.default({}),
    variablesDict: ConnectorRecordsSchema.default({}),
    variableValueLookUpDicts: z.array(ConnectorResultMapSchema).default([{}]),
    globalVariables: GlobalVariableRecordsSchema.default({}),
  })
  .transform((flowConfig) => {
    // This transform creates a Condition Target for nodes (except
    // InputNode and OutputNode) that does not have one.

    const nodeConfigs = flowConfig.nodeConfigsDict;
    let connectors = flowConfig.variablesDict;

    for (const nodeConfig of D.values(nodeConfigs)) {
      if (
        nodeConfig.type === NodeType.InputNode ||
        nodeConfig.type === NodeType.OutputNode
      ) {
        continue;
      }

      let conditionTarget = D.values(connectors).find(
        (connector): connector is ConditionTarget => {
          return (
            connector.nodeId === nodeConfig.nodeId &&
            connector.type === ConnectorType.ConditionTarget
          );
        },
      );

      if (conditionTarget != null) {
        continue;
      }

      const connectorId = `${nodeConfig.nodeId}/${randomId()}`;

      conditionTarget = {
        type: ConnectorType.ConditionTarget,
        id: connectorId,
        nodeId: nodeConfig.nodeId,
      };

      connectors = D.set(connectors, connectorId, conditionTarget);
    }

    return {
      ...flowConfig,
      variablesDict: connectors,
    };
  });

export type CanvasDataV3 = z.infer<typeof CanvasDataSchemaV3>;
