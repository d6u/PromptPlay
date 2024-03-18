import z from 'zod';
import { VariableValueType } from './variable-value-type';

export const FlowInputVariableSchemaDeprecated = z.object({
  type: z.literal('FlowInput'),
  id: z.string(),
  name: z.string(),
  nodeId: z.string(),
  index: z.number(),
  valueType: z.enum([VariableValueType.String, 'Number']),
});

export const FlowOutputVariableSchemaDeprecated = z.object({
  type: z.literal('FlowOutput'),
  id: z.string(),
  name: z.string(),
  nodeId: z.string(),
  index: z.number(),
  valueType: z.enum([VariableValueType.String, VariableValueType.Audio]),
});

export type FlowInputVariableDeprecated = z.infer<
  typeof FlowInputVariableSchemaDeprecated
>;
export type FlowOutputVariableDeprecated = z.infer<
  typeof FlowOutputVariableSchemaDeprecated
>;
