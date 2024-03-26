import { ReactNode } from 'react';
import { ZodSchema } from 'zod';

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
  // Define helperText as a function so that we don't have to execute it's
  // jsx code when not needed, e.g. on the server side.
  helperText?: () => ReactNode;
};

export type StopSequenceFieldDefinition = {
  type: FieldType.StopSequence;
  label: string;
  placeholder?: string;
  helperText?: () => ReactNode;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type NumberFieldDefinition<T = any> = {
  type: FieldType.Number;
  label: string;
  min?: number;
  max?: number;
  step?: number;
  helperText?: () => ReactNode;
  // Validation and transformation
  render?: (value: T) => number | null;
  parse?: (value: number | null) => T;
  schema?: ZodSchema;
};

export type TextareaFieldDefinition = {
  type: FieldType.Textarea;
  label: string;
  placeholder?: string;
  helperText?: () => ReactNode;
};

export type RadioFieldDefinition = {
  type: FieldType.Radio;
  options: FieldOption[];
  label: string;
  helperText?: () => ReactNode;
};

export type SelectFieldDefinition = {
  type: FieldType.Select;
  options: FieldOption[];
  label: string;
  helperText?: () => ReactNode;
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
  helperText?: () => ReactNode;
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
  schema?: ZodSchema;
};
