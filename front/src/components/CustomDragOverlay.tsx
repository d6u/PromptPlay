import {
  beingDraggingElementIdState,
  isReorderingBlockSetState,
} from "../state/store";
import DraggingBlock from "./blocks/DraggingBlock";
import { DragOverlay } from "@dnd-kit/core";
import { ReactElement } from "react";
import { useRecoilValue } from "recoil";

export default function CustomDragOverlay() {
  const beingDraggingElementId = useRecoilValue(beingDraggingElementIdState);
  const isReorderingBlockSet = useRecoilValue(isReorderingBlockSetState);

  let content: ReactElement | null;
  if (isReorderingBlockSet) {
    content = null;
  } else if (beingDraggingElementId != null) {
    content = <DraggingBlock id={beingDraggingElementId} />;
  } else {
    content = null;
  }

  return <DragOverlay dropAnimation={null}>{content}</DragOverlay>;
}
