import { Option } from '@mobily/ts-belt';
import { ReactNode } from 'react';

export type VariableConfig = Readonly<{
  id: string;
  name: string;
  isGlobal: boolean;
  globalVariableId: string | null;
  isVariableFixed: boolean;
  helperText?: ReactNode;
}>;

export type ConditionConfig = Readonly<{
  id: string;
  expressionString: string;
  isReadOnly: boolean;
  isMatched: Option<boolean>;
}>;

export type VariableFormValue = {
  list: VariableConfig[];
};

export type ConditionFormValue = {
  list: ConditionConfig[];
};
