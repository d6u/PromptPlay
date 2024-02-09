import Joi from 'joi';
import { ReactNode } from 'react';

export enum FieldType {
  Text = 'Text',
  StopSequence = 'StopSequence',
  Number = 'Number',
  Textarea = 'Textarea',
  Radio = 'Radio',
  Select = 'Select',
  Checkbox = 'Checkbox',
  SpecialRendering = 'SpecialRendering',
}

// ANCHOR: Instance Level Fields

export type TextFieldDefinition = {
  type: FieldType.Text;
  label: string;
  placeholder?: string;
  helperText?: ReactNode;
};

export type StopSequenceFieldDefinition = {
  type: FieldType.StopSequence;
  label: string;
  placeholder?: string;
  helperText?: ReactNode;
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

export type RadioFieldDefinition = {
  type: FieldType.Radio;
  options: FieldOption[];
  label: string;
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type CheckboxFieldDefinition<T = any> = {
  type: FieldType.Checkbox;
  label: string;
  render?: (value: T) => boolean;
  parse?: (value: boolean) => T;
  helperText?: ReactNode;
};

// Special Rendering field's logic will be held within the specific
// node component.
export type SpecialRenderingFieldDefinition = {
  type: FieldType.SpecialRendering;
};

export type NodeInstanceLevelFieldDefinitionUnion =
  | TextFieldDefinition
  | StopSequenceFieldDefinition
  | NumberFieldDefinition
  | TextareaFieldDefinition
  | RadioFieldDefinition
  | SelectFieldDefinition
  | CheckboxFieldDefinition
  | SpecialRenderingFieldDefinition;

// ANCHOR: Account Level Fields

export type NodeAccountLevelTextFieldDefinition = {
  type: FieldType.Text;
  // Displaying in UI
  label: string;
  placeholder?: string;
  helperMessage?: ReactNode;
  // Validation
  schema?: Joi.StringSchema;
};
