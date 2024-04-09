export const ConnectorType = {
  NodeInput: 'NodeInput',
  NodeOutput: 'NodeOutput',
  InCondition: 'InCondition',
  OutCondition: 'OutCondition',
} as const;

export type ConnectorTypeEnum =
  (typeof ConnectorType)[keyof typeof ConnectorType];
