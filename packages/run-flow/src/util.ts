import { D } from '@mobily/ts-belt';
import * as A from 'fp-ts/Array';
import * as R from 'fp-ts/Record';
import { pipe } from 'fp-ts/function';
import * as S from 'fp-ts/string';
import invariant from 'tiny-invariant';

import {
  ConnectorType,
  NodeAccountLevelTextFieldDefinition,
  NodeAllLevelConfigUnion,
  NodeConfig,
  getNodeDefinitionForNodeTypeName,
  type IncomingCondition,
  type NodeInputVariable,
} from 'flow-models';

import {
  ValidationErrorType,
  type AccountLevelValidationError,
} from './event-types';
import { GetAccountLevelFieldValueFunction } from './run-param-types';
import type { RunFlowParams } from './types';
import {
  ConnectorRunState,
  EdgeRunState,
  NodeRunState,
  RunFlowStates,
} from './types';

type Error = {
  nodeAllLevelConfigs?: never;
  errors: AccountLevelValidationError[];
};

type Success = {
  nodeAllLevelConfigs: Readonly<Record<string, NodeAllLevelConfigUnion>>;
  errors?: never;
};

export function getNodeAllLevelConfigOrValidationErrors(
  nodeConfigs: Readonly<Record<string, NodeConfig>>,
  getAccountLevelFieldValue: GetAccountLevelFieldValueFunction,
): Error | Success {
  const validationErrors: AccountLevelValidationError[] = [];

  const nodeAllLevelConfigs = D.map(nodeConfigs, (nodeConfig) => {
    const nodeDefinition = getNodeDefinitionForNodeTypeName(nodeConfig.type);

    const accountLevelConfigFieldDefinitions =
      nodeDefinition.accountLevelConfigFieldDefinitions as
        | Record<string, NodeAccountLevelTextFieldDefinition>
        | undefined;

    // TODO: Add validation to ensure typesafety, this cannot be done
    // in TypeScript due to the dynamic types used.
    if (!accountLevelConfigFieldDefinitions) {
      return nodeConfig as NodeAllLevelConfigUnion;
    }

    const accountLevelConfig = D.mapWithKey(
      accountLevelConfigFieldDefinitions,
      (fieldKey, accountLevelConfigFieldDefinition) => {
        const fieldValue = getAccountLevelFieldValue(nodeConfig.type, fieldKey);

        if (!accountLevelConfigFieldDefinition.schema) {
          return fieldValue;
        }

        const result =
          accountLevelConfigFieldDefinition.schema.safeParse(fieldValue);

        if (result.success) {
          return fieldValue;
        }

        result.error.errors.forEach((issue) => {
          validationErrors.push({
            type: ValidationErrorType.AccountLevel,
            nodeType: nodeConfig.type,
            fieldKey: fieldKey,
            message: issue.message,
          });
        });

        return null;
      },
    );

    return {
      ...nodeConfig,
      ...accountLevelConfig,
    } as NodeAllLevelConfigUnion;
  });

  if (validationErrors.length) {
    return { errors: validationErrors };
  } else {
    return { nodeAllLevelConfigs };
  }
}

export function createInitialRunState(params: RunFlowParams): RunFlowStates {
  const connectorStates = R.map((_) => ConnectorRunState.UNCONNECTED)(
    params.connectors,
  );

  const sourceHandleToEdgeIds: Record<string, string[]> = {};
  const edgeIdToTargetHandle: Record<string, string> = {};

  for (const { id, sourceHandle, targetHandle } of params.edges) {
    invariant(sourceHandle != null, 'sourceHandle is required');
    invariant(targetHandle != null, 'targetHandle is required');

    if (sourceHandleToEdgeIds[sourceHandle] == null) {
      sourceHandleToEdgeIds[sourceHandle] = [];
    }

    sourceHandleToEdgeIds[sourceHandle].push(id);

    edgeIdToTargetHandle[id] = targetHandle;

    connectorStates[sourceHandle] = ConnectorRunState.PENDING;
    connectorStates[targetHandle] = ConnectorRunState.PENDING;
  }

  return {
    nodeStates: R.map((_) => NodeRunState.PENDING)(params.nodeConfigs),
    connectorStates: connectorStates,
    edgeStates: pipe(
      params.edges,
      A.map((edge): [string, EdgeRunState] => [edge.id, EdgeRunState.PENDING]),
      R.fromEntries,
    ),
    sourceHandleToEdgeIds: sourceHandleToEdgeIds,
    edgeIdToTargetHandle: edgeIdToTargetHandle,
  };
}

export function getIncomingConnectors(params: RunFlowParams, nodeId: string) {
  return pipe(
    params.connectors,
    R.collect(S.Ord)((_, c) => c),
    A.filter(
      (c): c is NodeInputVariable | IncomingCondition =>
        c.nodeId === nodeId &&
        (c.type === ConnectorType.NodeInput ||
          c.type === ConnectorType.InCondition),
    ),
  );
}
