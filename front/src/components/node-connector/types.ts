import { Option } from '@mobily/ts-belt';
import type { NodeInputVariable, NodeOutputVariable } from 'flow-models';
import { ReactNode } from 'react';

export type VariableConfig = Readonly<{
  id: string;
  name: string;
  isGlobal: boolean;
  globalVariableId: string | null;
}>;

export type VariableDefinition = Readonly<{
  isVariableFixed: boolean;
  helperText?: () => ReactNode;
}>;

export type ConditionConfig = Readonly<{
  id: string;
  expressionString: string;
  isReadOnly: boolean;
  isMatched: Option<boolean>;
}>;

export type VariableFormValue = {
  list: (NodeInputVariable | NodeOutputVariable)[];
};

export type ConditionFormValue = {
  list: ConditionConfig[];
};

// ANCHOR: Node Output Variable

export type NodeOutputVariableProps = {
  id: string;
  name: string;
  value: unknown;
  isGlobal: boolean;
  globalVariableId: string | null;
};

export type NodeOutputVariablePropsArrayFieldValues = {
  list: NodeOutputVariableProps[];
};
