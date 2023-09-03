import { atom } from "recoil";

export const LOCAL_USER_SETTINGS = "localUserSettings";

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
