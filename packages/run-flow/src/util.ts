import * as A from 'fp-ts/Array';
import * as R from 'fp-ts/Record';
import { pipe } from 'fp-ts/function';
import { from } from 'rxjs';
import invariant from 'tiny-invariant';

import {
  ConnectorType,
  NodeAccountLevelTextFieldDefinition,
  NodeAllLevelConfigUnion,
  NodeConfig,
  getNodeDefinitionForNodeTypeName,
  type ConnectorRecords,
  type CreateNodeExecutionObservableFunction,
  type IncomingCondition,
  type NodeInputVariable,
  type NodeOutputVariable,
  type OutgoingCondition,
  type RunNodeFunction,
} from 'flow-models';

import {
  ValidationErrorType,
  type AccountLevelValidationError,
} from './event-types';
import { GetAccountLevelFieldValueFunction } from './run-param-types';
import type {
  ConnectorRunStateEnum,
  EdgeRunStateEnum,
  RunFlowParams,
} from './types';
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

  const nodeAllLevelConfigs = pipe(
    nodeConfigs,
    R.map((nodeConfig) => {
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

      const accountLevelConfig = pipe(
        accountLevelConfigFieldDefinitions,
        R.mapWithIndex(
          (
            fieldKey,
            accountLevelConfigFieldDefinition: NodeAccountLevelTextFieldDefinition,
          ) => {
            const fieldValue = getAccountLevelFieldValue(
              nodeConfig.type,
              fieldKey,
            );

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
        ),
      );

      return {
        ...nodeConfig,
        ...accountLevelConfig,
      } as NodeAllLevelConfigUnion;
    }),
  );

  if (validationErrors.length) {
    return { errors: validationErrors };
  } else {
    return { nodeAllLevelConfigs };
  }
}

export function createIdMaps(params: RunFlowParams): {
  sourceHandleToEdgeIds: Record<string, string[]>;
  edgeIdToTargetHandle: Record<string, string>;
  targetHandleToEdgeIds: Record<string, string[]>;
} {
  const sourceHandleToEdgeIds: Record<string, string[]> = {};
  const edgeIdToTargetHandle: Record<string, string> = {};
  const targetHandleToEdgeIds: Record<string, string[]> = {};

  for (const { id, sourceHandle, targetHandle } of params.edges) {
    invariant(sourceHandle != null, 'sourceHandle is required');
    invariant(targetHandle != null, 'targetHandle is required');

    if (sourceHandleToEdgeIds[sourceHandle] == null) {
      sourceHandleToEdgeIds[sourceHandle] = [];
    }

    if (targetHandleToEdgeIds[targetHandle] == null) {
      targetHandleToEdgeIds[targetHandle] = [];
    }

    sourceHandleToEdgeIds[sourceHandle].push(id);
    targetHandleToEdgeIds[targetHandle].push(id);

    edgeIdToTargetHandle[id] = targetHandle;
  }

  return {
    sourceHandleToEdgeIds,
    edgeIdToTargetHandle,
    targetHandleToEdgeIds,
  };
}

export function createInitialRunState(params: RunFlowParams): RunFlowStates {
  const connectorStates = pipe(
    params.connectors,
    R.map((): ConnectorRunStateEnum => ConnectorRunState.UNCONNECTED),
  );

  for (const { sourceHandle, targetHandle } of params.edges) {
    invariant(sourceHandle != null, 'sourceHandle is required');
    invariant(targetHandle != null, 'targetHandle is required');

    connectorStates[sourceHandle] = ConnectorRunState.PENDING;
    connectorStates[targetHandle] = ConnectorRunState.PENDING;
  }

  return {
    nodeStates: R.map((_) => NodeRunState.PENDING)(params.nodeConfigs),
    connectorStates: connectorStates,
    edgeStates: pipe(
      params.edges,
      A.map((edge): [string, EdgeRunStateEnum] => [
        edge.id,
        EdgeRunState.PENDING,
      ]),
      R.fromEntries,
    ),
  };
}

export function getIncomingConnectorsForNode(
  connectors: ConnectorRecords,
  nodeId: string,
) {
  return Object.values(connectors).filter(
    (c): c is NodeInputVariable | IncomingCondition =>
      c.nodeId === nodeId &&
      (c.type === ConnectorType.NodeInput ||
        c.type === ConnectorType.InCondition),
  );
}

export function getIncomingConditionsForNode(
  connectors: ConnectorRecords,
  nodeId: string,
): IncomingCondition[] {
  return Object.values(connectors)
    .filter(
      (c): c is IncomingCondition =>
        c.nodeId === nodeId && c.type === ConnectorType.InCondition,
    )
    .sort((a, b) => a.index! - b.index!);
}

export function getOutgoingConditionsForNode(
  connectors: ConnectorRecords,
  nodeId: string,
): OutgoingCondition[] {
  return Object.values(connectors)
    .filter(
      (c): c is OutgoingCondition =>
        c.nodeId === nodeId && c.type === ConnectorType.OutCondition,
    )
    .sort((a, b) => a.index - b.index);
}

export function getOutputVariablesForNode(
  connectors: ConnectorRecords,
  nodeId: string,
): NodeOutputVariable[] {
  return Object.values(connectors)
    .filter(
      (c): c is NodeOutputVariable =>
        c.nodeId === nodeId && c.type === ConnectorType.NodeOutput,
    )
    .sort((a, b) => a.index - b.index);
}

export function getInputVariablesForNode(
  connectors: ConnectorRecords,
  nodeId: string,
): NodeInputVariable[] {
  return Object.values(connectors)
    .filter(
      (c): c is NodeInputVariable =>
        c.nodeId === nodeId && c.type === ConnectorType.NodeInput,
    )
    .sort((a, b) => a.index - b.index);
}

export function getRunNodeFunction(
  nodeConfig: NodeAllLevelConfigUnion,
): CreateNodeExecutionObservableFunction<NodeAllLevelConfigUnion> {
  const nodeDefinition = getNodeDefinitionForNodeTypeName(nodeConfig.type);

  if (
    nodeDefinition.createNodeExecutionObservable == null &&
    nodeDefinition.runNode == null
  ) {
    throw new Error(
      'NodeDefinition does not have runNode or createNodeExecutionObservable',
    );
  }

  if (nodeDefinition.createNodeExecutionObservable != null) {
    // `createNodeExecutionObservable` is a union type like this:
    //
    // ```
    // | CreateNodeExecutionObservableFunction<InputNodeInstanceLevelConfig>
    // | CreateNodeExecutionObservableFunction<OutputNodeInstanceLevelConfig>
    // | ...
    // ```
    //
    // this will deduce the argument type of
    // `createNodeExecutionObservable` to never when called.
    // Cast it to a more flexible type to avoid this issue.
    return nodeDefinition.createNodeExecutionObservable as CreateNodeExecutionObservableFunction<NodeAllLevelConfigUnion>;
  } else {
    // No null check needed here, because we checked it above.
    const runNode =
      nodeDefinition.runNode as RunNodeFunction<NodeAllLevelConfigUnion>;
    return (params) => from(runNode(params));
  }
}
