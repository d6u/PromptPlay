import type { ReactNode } from 'react';

export enum FieldType {
  Text = 'Text',
  Number = 'Number',
  Textarea = 'Textarea',
  Radio = 'Radio',
  Select = 'Select',
}

export type FieldDefinition =
  | TextFieldDefinition
  | NumberFieldDefinition
  | TextareaFieldDefinition
  | {
      type: FieldType.Radio;
      options: FieldOption[];
      label: string;
      helperMessage?: ReactNode;
    }
  | {
      type: FieldType.Select;
      options: FieldOption[];
      label: string;
      helperMessage?: ReactNode;
    };

export type TextFieldDefinition = {
  type: FieldType.Text;
  label: string;
  transformBeforeRender?: (value: unknown) => string;
  transformBeforeSave?: (value: string) => unknown;
  placeholder?: string;
  helperMessage?: ReactNode;
};

export type NumberFieldDefinition = {
  type: FieldType.Number;
  label: string;
  // Fallback value is used when the field is empty
  min?: number;
  max?: number;
  step?: number;
  transformBeforeSave?: (value: string) => number | null;
  helperMessage?: ReactNode;
};

export type TextareaFieldDefinition = {
  type: FieldType.Textarea;
  label: string;
  placeholder?: string;
  helperMessage?: ReactNode;
};

export type FieldOption = {
  label: string;
  value: string;
};
