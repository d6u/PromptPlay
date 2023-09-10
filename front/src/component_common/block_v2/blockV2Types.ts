import { BlockType } from "../../static/spaceTypes";

export enum VisualBlockType {
  Plain = "Plain",
  Error = "Error",
  Databag = "Databag",
  LlmMessage = "LlmMessage",
  AppendToList = "AppendToList",
  Llm = "Llm",
  GetAttribute = "GetAttribute",
  Parser = "Parser",
  Output = "Output",
}

export enum BlockWidthClass {
  Square = "Square",
  Wider = "Wider",
  Full = "Full",
}

export function blockTypeToVisualBlockType(
  blockType: BlockType
): VisualBlockType {
  switch (blockType) {
    case BlockType.Databag:
      return VisualBlockType.Databag;
    case BlockType.LlmMessage:
      return VisualBlockType.LlmMessage;
    case BlockType.AppendToList:
      return VisualBlockType.AppendToList;
    case BlockType.Llm:
      return VisualBlockType.Llm;
    case BlockType.GetAttribute:
      return VisualBlockType.GetAttribute;
    case BlockType.Parser:
      return VisualBlockType.Parser;
  }
}

export function visualBlockTypeToBlockType(
  blockType: VisualBlockType
): BlockType | null {
  switch (blockType) {
    case VisualBlockType.Databag:
      return BlockType.Databag;
    case VisualBlockType.LlmMessage:
      return BlockType.LlmMessage;
    case VisualBlockType.AppendToList:
      return BlockType.AppendToList;
    case VisualBlockType.Llm:
      return BlockType.Llm;
    case VisualBlockType.GetAttribute:
      return BlockType.GetAttribute;
    case VisualBlockType.Parser:
      return BlockType.Parser;
    case VisualBlockType.Output:
    case VisualBlockType.Plain:
    case VisualBlockType.Error:
      return null;
  }
}
