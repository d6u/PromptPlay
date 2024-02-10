import { ReactNode } from 'react';

export type FieldValues = {
  list: ConnectorConfig[];
};

export type ConnectorConfig = Readonly<{
  value: string;
}>;

export type VariableConfig = Readonly<{
  id: string;
  name: string;
  isReadOnly: boolean;
  helperText?: ReactNode;
}>;

export type ConditionConfig = Readonly<{
  id: string;
  expressionString: string;
  isReadOnly: boolean;
  isMatched: boolean;
  helperMessage?: ReactNode;
}>;
