import z from 'zod';

import {
  ConnectorType,
  VariableValueType,
  type IncomingCondition,
  type NodeInputVariable,
  type NodeOutputVariable,
  type OutgoingCondition,
} from '../../base-types';
import {
  NodeDefinition,
  NodeKind,
  NodeType,
} from '../../node-definition-base-types';

export const ConcatNodeConfigSchema = z.object({
  kind: z.literal(NodeKind.Process),
  type: z.literal(NodeType.Concat),
  nodeId: z.string(),
});

export type ConcatNodeInstanceLevelConfig = z.infer<
  typeof ConcatNodeConfigSchema
>;

export type ConcatNodeAllLevelConfig = ConcatNodeInstanceLevelConfig;

export const CONCAT_NODE_DEFINITION: NodeDefinition<
  ConcatNodeInstanceLevelConfig,
  ConcatNodeAllLevelConfig
> = {
  type: NodeType.Concat,
  label: 'Concatenate',

  instanceLevelConfigFieldDefinitions: {},

  canUserAddIncomingVariables: true,
  variableValueTypeForUserAddedIncomingVariable: VariableValueType.String,

  createDefaultNodeConfigsAndConnectors(context) {
    const nodeId = context.generateNodeId();

    return {
      nodeConfigs: [
        {
          kind: NodeKind.Process,
          type: NodeType.Concat,
          nodeId: nodeId,
        } as ConcatNodeInstanceLevelConfig,
      ],
      connectors: [
        {
          type: ConnectorType.InCondition,
          id: context.generateConnectorId(nodeId),
          nodeId: nodeId,
        } as IncomingCondition,
        {
          type: ConnectorType.OutCondition,
          id: context.generateConnectorId(nodeId),
          index: 0,
          nodeId: nodeId,
          expressionString: '',
        } as OutgoingCondition,
        {
          type: ConnectorType.NodeInput,
          id: context.generateConnectorId(nodeId),
          name: 'input1',
          nodeId: nodeId,
          index: 0,
          valueType: VariableValueType.String,
          isGlobal: false,
          globalVariableId: null,
        } as NodeInputVariable,
        {
          type: ConnectorType.NodeOutput,
          id: `${nodeId}/result`,
          name: 'result',
          nodeId: nodeId,
          index: 0,
          valueType: VariableValueType.String,
          isGlobal: false,
          globalVariableId: null,
        } as NodeOutputVariable,
      ],
    };
  },

  async runNode(params) {
    const { inputVariableValues } = params;

    const isInputsAllArray = inputVariableValues.every((v) => Array.isArray(v));
    const isInputsAllString = inputVariableValues.every(
      (v) => typeof v === 'string',
    );

    if (!isInputsAllArray && !isInputsAllString) {
      throw new Error('All inputs must be either arrays or strings');
    }

    if (isInputsAllArray) {
      const result = inputVariableValues.reduce(
        (acc: unknown[], v) => acc.concat(v),
        [],
      );
      return { variableValues: [result] };
    }

    const result = inputVariableValues.join('');
    return { variableValues: [result] };
  },
};
