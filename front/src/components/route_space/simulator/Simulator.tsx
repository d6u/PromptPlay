import { FragmentType, gql, useFragment } from "../../../__generated__";
import {
  beingDraggingElementIdState,
  cursorPointingBlockSetIdState,
  cursorPositionState,
  isReorderingBlockSetState,
} from "../../../state/store";
import BlockSet from "./BlockSet";
import "./Simulator.css";
import { DragOverlay } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { ReactElement, useEffect } from "react";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";

const SIMULATOR_FRAGMENT = gql(`
  fragment Simulator on Preset {
    id
    blockSets {
      id
      ...SimulatorBlockSet
    }
  }
`);

export default function Simulator({
  simulatorFragment,
}: {
  simulatorFragment: FragmentType<typeof SIMULATOR_FRAGMENT>;
}) {
  // --- Global State ---

  const [cursorPosition, setCursorPosition] =
    useRecoilState(cursorPositionState);
  const setCursorPointingBlockSetId = useSetRecoilState(
    cursorPointingBlockSetIdState
  );
  const isReorderingBlockSet = useRecoilValue(isReorderingBlockSetState);
  const beingDraggingElementId = useRecoilValue(beingDraggingElementIdState);

  // --- GraphQL ---

  const simulator = useFragment(SIMULATOR_FRAGMENT, simulatorFragment);

  // --- State ---

  useEffect(() => {
    if (simulator.blockSets.length === 0) {
      setCursorPosition(0);
    } else {
      setCursorPosition(
        (cursorPosition) => cursorPosition % simulator.blockSets.length
      );
    }
  }, [setCursorPosition, simulator.blockSets.length]);

  useEffect(() => {
    const targetBlockSet = simulator.blockSets[cursorPosition];
    setCursorPointingBlockSetId(targetBlockSet?.id ?? null);
  }, [simulator.blockSets, cursorPosition, setCursorPointingBlockSetId]);

  let dragOverlayContent: ReactElement | null = null;
  if (isReorderingBlockSet) {
    const blockSetId = beingDraggingElementId!.split(":")[1];
    const blockSetFragment = simulator.blockSets.find(
      ({ id }) => id === blockSetId
    )!;
    dragOverlayContent = (
      <BlockSet blockSetFragment={blockSetFragment} isDraggingOverlay={true} />
    );
  }

  return (
    <div className="Simulator">
      <div className="Simulator_inner">
        <SortableContext
          items={simulator.blockSets.map((blockSet) => ({
            id: `BlockSet:${blockSet.id}:Sortable`,
          }))}
          strategy={verticalListSortingStrategy}
        >
          {simulator.blockSets.map((blockSet, index) => (
            <BlockSet
              key={blockSet.id}
              blockSetFragment={blockSet}
              index={index}
            />
          ))}
        </SortableContext>
      </div>
      <DragOverlay dropAnimation={null}>{dragOverlayContent}</DragOverlay>
    </div>
  );
}
