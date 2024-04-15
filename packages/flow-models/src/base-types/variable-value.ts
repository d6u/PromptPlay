import z from 'zod';

const VariableValueBoxSchema = z.object({
  value: z.unknown(),
});

export type VariableValueBox = z.infer<typeof VariableValueBoxSchema>;

// ANCHOR: Collection

export const VariableValueRecordsSchema = z.record(VariableValueBoxSchema);

export type VariableValueRecords = z.infer<typeof VariableValueRecordsSchema>;
