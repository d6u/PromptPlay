import { create, StateCreator } from 'zustand';

import { createSelectors } from 'generic-util/zustand';

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

const spaceStateCreator: StateCreator<SpaceState, [], [], SpaceState> = (
  set,
) => ({
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
});

export const useSpaceStore = createSelectors(
  create<SpaceState>()(spaceStateCreator),
);
