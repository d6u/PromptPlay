import type { ReactNode } from 'react';

export enum FieldType {
  Text = 'Text',
  Number = 'Number',
  Textarea = 'Textarea',
  Radio = 'Radio',
  Select = 'Select',
  Checkbox = 'Checkbox',
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
  | SelectFieldDefinition
  | CheckboxFieldDefinition;

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

export type SelectFieldDefinition = {
  type: FieldType.Select;
  options: FieldOption[];
  label: string;
  helperMessage?: ReactNode;
};

export type FieldOption = {
  label: string;
  value: string;
};

export type CheckboxFieldDefinition = {
  type: FieldType.Checkbox;
  label: string;
  transformBeforeRender?: (value: unknown) => boolean;
  transformBeforeSave?: (value: boolean) => unknown;
  helperMessage?: ReactNode;
};
