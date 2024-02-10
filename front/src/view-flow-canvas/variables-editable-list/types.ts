import { ReactNode } from 'react';

export type FormValue = {
  variables: VariableConfig[];
};

export type VariableConfig = Readonly<{
  id: string;
  name: string;
  isReadOnly: boolean;
  helperMessage?: ReactNode;
}>;
