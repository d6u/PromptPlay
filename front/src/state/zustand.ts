import { create } from "zustand";
import { persist } from "zustand/middleware";

type OpenAiApiState = {
  openAiApiKey: string | null;
  setOpenAiApiKey: (openAiApiKey: string | null) => void;
};

type PlaceholderUserTokenState = {
  placeholderUserToken: string | null;
  setPlaceholderUserToken: (placeholderUserToken: string | null) => void;
};

type PersistState = OpenAiApiState & PlaceholderUserTokenState;

export const usePersistStore = create<PersistState>()(
  persist(
    (set) => ({
      openAiApiKey: null,
      setOpenAiApiKey: (openAiApiKey) => set(() => ({ openAiApiKey })),
      placeholderUserToken: null,
      setPlaceholderUserToken: (placeholderUserToken) =>
        set(() => ({ placeholderUserToken })),
    }),
    {
      name: "localUserSettings",
    }
  )
);

type State = {
  missingOpenAiApiKey: boolean;
  setMissingOpenAiApiKey: (missingOpenAiApiKey: boolean) => void;
  spaceV2SelectedBlockId: string | null;
  setSpaceV2SelectedBlockId: (spaceV2SelectedBlockId: string | null) => void;
};

export const useStore = create<State>()((set) => ({
  missingOpenAiApiKey: false,
  setMissingOpenAiApiKey: (missingOpenAiApiKey) =>
    set(() => ({ missingOpenAiApiKey })),
  spaceV2SelectedBlockId: null,
  setSpaceV2SelectedBlockId: (spaceV2SelectedBlockId) =>
    set(() => ({ spaceV2SelectedBlockId })),
}));
