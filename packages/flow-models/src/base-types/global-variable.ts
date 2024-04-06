import z from 'zod';

import { VariableValueType } from './variable-value-type';

export const GlobalVariableSchema = z.object({
  id: z.string(),
  name: z.string(),
  valueType: z.enum([
    VariableValueType.Structured,
    VariableValueType.String,
    VariableValueType.Audio,
    VariableValueType.Unspecified,
  ]),
});

export type GlobalVariable = z.infer<typeof GlobalVariableSchema>;

export const GlobalVariableRecordsSchema = z.record(GlobalVariableSchema);

export type GlobalVariableRecords = z.infer<typeof GlobalVariableRecordsSchema>;
