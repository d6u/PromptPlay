export const ConnectorType = {
  FlowInput: 'FlowInput',
  FlowOutput: 'FlowOutput',
  NodeInput: 'NodeInput',
  NodeOutput: 'NodeOutput',
  Condition: 'Condition',
  ConditionTarget: 'ConditionTarget',
} as const;

export type ConnectorTypeEnum =
  (typeof ConnectorType)[keyof typeof ConnectorType];
