import z from 'zod';

export const NodeConfigCommonSchema = z.object({
  nodeId: z.string(),
  inputVariableIds: z.array(z.string()).default([]),
  outputVariableIds: z.array(z.string()).default([]),
});
