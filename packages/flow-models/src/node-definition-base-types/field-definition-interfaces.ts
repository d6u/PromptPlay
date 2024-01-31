import type { ReactNode } from 'react';

export enum FieldType {
  Textarea = 'Textarea',
  Text = 'Text',
  Radio = 'Radio',
}

export type FieldDefinition =
  | {
      type: FieldType.Text;
      label: string;
      placeholder?: string;
      helperMessage?: ReactNode;
    }
  | {
      type: FieldType.Textarea;
      label: string;
      placeholder?: string;
      helperMessage?: ReactNode;
    }
  | {
      type: FieldType.Radio;
      options: string[];
      label: string;
      helperMessage?: ReactNode;
    };
