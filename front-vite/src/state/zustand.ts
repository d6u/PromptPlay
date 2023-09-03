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

type State = OpenAiApiState & PlaceholderUserTokenState;

export const usePersistStore = create<State>()(
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
