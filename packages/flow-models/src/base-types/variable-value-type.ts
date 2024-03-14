export const VariableValueType = {
  Number: 'Number',
  String: 'String',
  Audio: 'Audio',
  Unknown: 'Unknown',
} as const;

export type VariableValueTypeEnum =
  (typeof VariableValueType)[keyof typeof VariableValueType];
