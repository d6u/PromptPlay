import { create } from "zustand";
import { persist } from "zustand/middleware";

type OpenAIAPIKeyState = {
  openAiApiKey: string | null;
  setOpenAiApiKey: (openAiApiKey: string | null) => void;
};

type PlaceholderUserTokenState = {
  placeholderUserToken: string | null;
  setPlaceholderUserToken: (placeholderUserToken: string | null) => void;
};

export type LocalStorageState = OpenAIAPIKeyState & PlaceholderUserTokenState;

export const useLocalStorageStore = create<LocalStorageState>()(
  persist(
    (set) => ({
      openAiApiKey: null,
      setOpenAiApiKey: (openAiApiKey) => set(() => ({ openAiApiKey })),
      placeholderUserToken: null,
      setPlaceholderUserToken: (placeholderUserToken) =>
        set(() => ({ placeholderUserToken })),
    }),
    { name: "localUserSettings" }
  )
);

export type SpaceState = {
  missingOpenAiApiKey: boolean;
  setMissingOpenAiApiKey: (missingOpenAiApiKey: boolean) => void;
  spaceV2SelectedBlockId: string | null;
  setSpaceV2SelectedBlockId: (spaceV2SelectedBlockId: string | null) => void;
};

export const useSpaceStore = create<SpaceState>()((set) => ({
  missingOpenAiApiKey: false,
  setMissingOpenAiApiKey: (missingOpenAiApiKey) =>
    set(() => ({ missingOpenAiApiKey })),
  spaceV2SelectedBlockId: null,
  setSpaceV2SelectedBlockId: (spaceV2SelectedBlockId) =>
    set(() => ({ spaceV2SelectedBlockId })),
}));
