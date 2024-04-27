import z from 'zod';
import {
  FieldType,
  type NodeAccountLevelTextFieldDefinition,
} from '../node-definition-base-types';

const DEFINITIONS = {
  openAiApiKey: {
    type: FieldType.Text,
    label: 'OpenAI API Key',
    placeholder: 'Enter API key here',
    helperMessage:
      "This is stored in your browser's local storage. Never uploaded.",
    schema: z.string().min(1, { message: 'OpenAI API Key is required' }),
  },
  bingSearchApiKey: {
    type: FieldType.Text,
    label: 'API key',
    placeholder: 'Enter API key here',
    helperMessage:
      "This is stored in your browser's local storage. Never uploaded.",
    schema: z.string().min(1, { message: 'API key is required' }),
  },
  elevenLabsApiKey: {
    type: FieldType.Text,
    label: 'API Key',
    placeholder: 'Enter API key here',
    helperMessage:
      "This is stored in your browser's local storage. Never uploaded.",
    schema: z.string().min(1, { message: 'API Key is required' }),
  },
  huggingFaceApiToken: {
    type: FieldType.Text,
    label: 'API Token',
    placeholder: 'Enter API key here',
    helperMessage:
      "This is stored in your browser's local storage. Never uploaded.",
    schema: z.string().min(1, { message: 'API Token is required' }),
  },
};

export const CANVAS_CONFIG_DEFINITIONS = DEFINITIONS as Record<
  // This cast is to make sure on SharedCavnasConfig type, we cannot use any
  // key that is not defined in the DEFINITIONS object.
  keyof typeof DEFINITIONS,
  NodeAccountLevelTextFieldDefinition
>;
