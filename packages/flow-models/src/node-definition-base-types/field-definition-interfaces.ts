import { ReactNode } from 'react';
import { ZodSchema } from 'zod';

import type { CANVAS_CONFIG_DEFINITIONS } from '../canvas-config-definitions';
import type { BaseNodeInstanceLevelConfig } from './node-definition-interface';

export enum FieldType {
  Text = 'Text',
  StopSequence = 'StopSequence',
  Number = 'Number',
  Textarea = 'Textarea',
  Radio = 'Radio',
  Select = 'Select',
  Checkbox = 'Checkbox',
  SharedCavnasConfig = 'SharedCavnasConfig',
  InputVariable = 'InputVariable',
  LlmMessages = 'LlmMessages',
  SpecialRendering = 'SpecialRendering',
}

// ANCHOR: Shared props

type NodeConfigFieldDefCommon = {
  // attrName will become the key on node config object
  attrName: string;
  // By default we fold nodeConfig field into the node config inspector
  // side pane. Set `showOnCanvas` to true to show the input on the canvas
  // node UI.
  showOnCanvas?: boolean;
};

// ANCHOR: Instance Level Fields

export type TextFieldDefinition = NodeConfigFieldDefCommon & {
  type: FieldType.Text;
  label: string;
  placeholder?: string;
  // Define helperText as a function so that we don't have to execute it's
  // jsx code when not needed, e.g. on the server side.
  helperText?: () => ReactNode;
};

export type StopSequenceFieldDefinition = NodeConfigFieldDefCommon & {
  type: FieldType.StopSequence;
  label: string;
  placeholder?: string;
  helperText?: () => ReactNode;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type NumberFieldDefinition<T = any> = NodeConfigFieldDefCommon & {
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

export type TextareaFieldDefinition = NodeConfigFieldDefCommon & {
  type: FieldType.Textarea;
  label: string;
  placeholder?: string;
  helperText?: () => ReactNode;
};

export type RadioFieldDefinition = NodeConfigFieldDefCommon & {
  type: FieldType.Radio;
  options: FieldOption[];
  label: string;
  helperText?: () => ReactNode;
};

export type SelectFieldDefinition = NodeConfigFieldDefCommon & {
  type: FieldType.Select;
  label: string;
  helperText?: () => ReactNode;
} & (
    | {
        options: FieldOption[];
      }
    | {
        dynamicOptions: (
          nodeConfigs: Record<string, BaseNodeInstanceLevelConfig>,
        ) => FieldOption[];
      }
  );

export type FieldOption = {
  label: string;
  value: string;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type CheckboxFieldDefinition<T = any> = NodeConfigFieldDefCommon & {
  type: FieldType.Checkbox;
  label: string;
  render?: (value: T) => boolean;
  parse?: (value: boolean) => T;
  helperText?: () => ReactNode;
};

export type SharedCavnasConfig = NodeConfigFieldDefCommon & {
  type: FieldType.SharedCavnasConfig;
  canvasConfigKey: keyof typeof CANVAS_CONFIG_DEFINITIONS;
};

export type InputVariableFieldDefinition = NodeConfigFieldDefCommon & {
  type: FieldType.InputVariable;
};

export type LlmMessagesFieldDefinition = NodeConfigFieldDefCommon & {
  type: FieldType.LlmMessages;
};

// Special Rendering field's logic will be held within the specific
// node component.
export type SpecialRenderingFieldDefinition = NodeConfigFieldDefCommon & {
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
  | SharedCavnasConfig
  | InputVariableFieldDefinition
  | LlmMessagesFieldDefinition
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
