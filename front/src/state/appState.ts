import { createLens } from '@dhmk/zustand-lens';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createSelectors } from '../utils/zustand-utils';

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

type GlobalFieldStorageState = {
  globalFields: Record<string, string>;
  getGlobalField: (key: string) => string;
  setGlobalField: (key: string, value: string) => void;
};

export type LocalStorageState = OpenAIAPIKeyState &
  HuggingFaceApiTokenState &
  ElevenLabsApiKeyState &
  GlobalFieldStorageState;

export const useLocalStorageStore = createSelectors(
  create<LocalStorageState>()(
    persist(
      (set, get) => {
        const [setGlobalField, getGlobalField] = createLens(
          set,
          get,
          'globalFields',
        );

        return {
          openAiApiKey: null,
          setOpenAiApiKey: (openAiApiKey) => set(() => ({ openAiApiKey })),
          huggingFaceApiToken: null,
          setHuggingFaceApiToken: (huggingFaceApiToken) =>
            set(() => ({ huggingFaceApiToken })),
          placeholderUserToken: null,
          elevenLabsApiKey: null,
          setElevenLabsApiKey: (elevenLabsApiKey: string | null) =>
            set(() => ({ elevenLabsApiKey })),

          globalFields: {},
          getGlobalField: (key) => getGlobalField()[key],
          setGlobalField: (key, value) => setGlobalField({ [key]: value }),
        };
      },
      { name: 'localUserSettings' },
    ),
  ),
);

export type SpaceState = {
  missingOpenAiApiKey: boolean;
  setMissingOpenAiApiKey: (missingOpenAiApiKey: boolean) => void;
  missingHuggingFaceApiToken: boolean;
  setMissingHuggingFaceApiToken: (missingHuggingFaceApiToken: boolean) => void;
  missingElevenLabsApiKey: boolean;
  setMissingElevenLabsApiKey: (missingElevenLabsApiKey: boolean) => void;
  spaceV2SelectedBlockId: string | null;
  setSpaceV2SelectedBlockId: (spaceV2SelectedBlockId: string | null) => void;
};

export const useSpaceStore = create<SpaceState>()((set) => ({
  missingOpenAiApiKey: false,
  setMissingOpenAiApiKey: (missingOpenAiApiKey) =>
    set(() => ({ missingOpenAiApiKey })),
  missingHuggingFaceApiToken: false,
  setMissingHuggingFaceApiToken: (missingHuggingFaceApiToken: boolean) =>
    set(() => ({ missingHuggingFaceApiToken })),
  missingElevenLabsApiKey: false,
  setMissingElevenLabsApiKey: (missingElevenLabsApiKey: boolean) =>
    set(() => ({ missingElevenLabsApiKey })),
  spaceV2SelectedBlockId: null,
  setSpaceV2SelectedBlockId: (spaceV2SelectedBlockId) =>
    set(() => ({ spaceV2SelectedBlockId })),
}));
