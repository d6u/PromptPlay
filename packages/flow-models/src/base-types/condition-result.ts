import z from 'zod';

const ConditionResultSchema = z.object({
  conditionId: z.string(),
  isConditionMatched: z.boolean(),
});

export type ConditionResult = z.infer<typeof ConditionResultSchema>;

// ANCHOR: Collection

export const ConditionResultRecordsSchema = z.record(ConditionResultSchema);

export type ConditionResultRecords = z.infer<
  typeof ConditionResultRecordsSchema
>;
