export const VariableValueType = {
  Structured: 'Structured',
  String: 'String',
  Audio: 'Audio',
  Any: 'Any',
  Unspecified: 'Unspecified',
} as const;

export type VariableValueTypeEnum =
  (typeof VariableValueType)[keyof typeof VariableValueType];
