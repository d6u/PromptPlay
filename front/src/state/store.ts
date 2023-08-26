import { Block, SpaceContent } from "../static/spaceTypes";
import { string } from "@recoiljs/refine";
import { atom, selector } from "recoil";
import { syncEffect } from "recoil-sync";

export const LOCAL_USER_SETTINGS = "localUserSettings";

export const openAiApiKeyState = atom<string>({
  key: "openAiApiKey",
  default: "",
  effects: [
    syncEffect({
      storeKey: LOCAL_USER_SETTINGS,
      itemKey: "openAiApiKey",
      refine: string(),
    }),
  ],
});

export const placeholderUserTokenState = atom<string>({
  key: "placeholderUserToken",
  default: "",
  effects: [
    syncEffect({
      storeKey: LOCAL_USER_SETTINGS,
      itemKey: "placeholderUserToken",
      refine: string(),
    }),
  ],
});

export const selectedBlockState = atom<string | null>({
  key: "selectedBlock",
  default: null,
});

export enum EditorElementType {
  Prompt,
  Completer,
  BlockSet,
}

export const selectedElementTypeState = atom<EditorElementType | null>({
  key: "selectedElementType",
  default: null,
});

export const cursorPositionState = atom<number>({
  key: "cursorPosition",
  default: 0,
});

export const cursorPointingBlockSetIdState = atom<string | null>({
  key: "cursorPointingBlockSetId",
  default: null,
});

export const beingDraggingElementIdState = atom<string | null>({
  key: "beingDraggingElementId",
  default: null,
});

export const isReorderingBlockSetState = atom<boolean>({
  key: "isReorderingBlockSet",
  default: false,
});

export const streamingBlockIdState = atom<string | null>({
  key: "streamingBlockId",
  default: null,
});

export const streamingOutputBlockContentState = atom<string>({
  key: "streamingOutputBlockContent",
  default: "",
});

export const missingOpenAiApiKeyState = atom<boolean>({
  key: "missingOpenAiApiKey",
  default: false,
});

export const spaceV2SelectedBlockIdState = atom<string | null>({
  key: "spaceV2SelectedBlockId",
  default: null,
});

export const spaceContentState = atom<SpaceContent | null>({
  key: "spaceContent",
  default: null,
});

export const spaceV2SelectedBlockSelector = selector({
  key: "spaceV2SelectedBlock",
  get: ({ get }) => {
    const spaceContent = get(spaceContentState);
    const selectedBlockId = get(spaceV2SelectedBlockIdState);

    if (spaceContent && selectedBlockId) {
      // TODO: Handle Group as well
      return spaceContent.components[selectedBlockId] as Block;
    }

    return null;
  },
});
