import { ChatGPTMessageRole } from 'integrations/openai';

export type FieldValues = {
  variableIds: string[];
  messages: Array<{
    type: 'inline' | 'inputVariable';
    variableId: string | null;
    value: { role: ChatGPTMessageRole; content: string } | null;
  }>;
};
