import { createLens } from '@dhmk/zustand-lens';
import { Option } from '@mobily/ts-belt';
import { create, StateCreator } from 'zustand';
import { persist } from 'zustand/middleware';

import { createSelectors } from 'generic-util/zustand';

type OpenAIAPIKeyState = {
  openAiApiKey: string | null;
  setOpenAiApiKey: (openAiApiKey: string | null) => void;
};

type HuggingFaceApiTokenState = {
  huggingFaceApiToken: string | null;
  setHuggingFaceApiToken: (huggingFaceApiToken: string | null) => void;
};

type ElevenLabsApiKeyState = {
  elevenLabsApiKey: string | null;
  setElevenLabsApiKey: (elevenLabsApiKey: string | null) => void;
};

export type LocalStorageState = OpenAIAPIKeyState &
  HuggingFaceApiTokenState &
  ElevenLabsApiKeyState & {
    localAccountLevelNodeFieldValues: Record<string, string>;
    getLocalAccountLevelNodeFieldValue: (fieldKey: string) => Option<string>;
    setLocalAccountLevelNodeFieldValue: (
      fieldKey: string,
      value: string,
    ) => void;
  };

const localStorageStateCreator: StateCreator<
  LocalStorageState,
  [['zustand/persist', unknown]],
  [],
  LocalStorageState
> = (set, get) => {
  const [
    localAccountLevelNodeFieldValuesSet,
    localAccountLevelNodeFieldValuesGet,
  ] = createLens(set, get, 'localAccountLevelNodeFieldValues');

  return {
    // TODO: Deprecate
    openAiApiKey: null,
    setOpenAiApiKey: (openAiApiKey) => set(() => ({ openAiApiKey })),
    huggingFaceApiToken: null,
    setHuggingFaceApiToken: (huggingFaceApiToken) =>
      set(() => ({ huggingFaceApiToken })),
    placeholderUserToken: null,
    elevenLabsApiKey: null,
    setElevenLabsApiKey: (elevenLabsApiKey: string | null) =>
      set(() => ({ elevenLabsApiKey })),

    localAccountLevelNodeFieldValues: {},
    getLocalAccountLevelNodeFieldValue: (fieldKey: string): Option<string> => {
      const key = getKeyForLocalAccountLevelNodeFieldValue(fieldKey);
      return localAccountLevelNodeFieldValuesGet()[key] as Option<string>;
    },
    setLocalAccountLevelNodeFieldValue: (
      fieldKey: string,
      value: string,
    ): void => {
      const key = getKeyForLocalAccountLevelNodeFieldValue(fieldKey);
      localAccountLevelNodeFieldValuesSet(() => ({ [key]: value }));
    },
  };
};

export const useLocalStorageStore = createSelectors(
  create<LocalStorageState>()(
    persist(localStorageStateCreator, { name: 'localUserSettings' }),
  ),
);

function getKeyForLocalAccountLevelNodeFieldValue(fieldKey: string): string {
  return `${fieldKey}`;
}
