import { FragmentType, gql, useFragment } from "../../__generated__";
import {
  beingDraggingElementIdState,
  isReorderingBlockSetState,
} from "../../state/store";
import CustomDragOverlay from "../CustomDragOverlay";
import "./Workspace.css";
import WorkspaceContent from "./WorkspaceContent";
import Editor from "./editor/Editor";
import { useMutation } from "@apollo/client";
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from "@dnd-kit/core";
import { useCallback } from "react";
import { useRecoilState, useSetRecoilState } from "recoil";

const WORKSPACE_FRAGMENT = gql(`
  fragment WorkspaceQuery on Query {
    ...WorkspaceContent
  }
`);

const ADD_PROMPT_TO_BLOCK_SET_TOP_INPUT_MUTATION = gql(`
  mutation AddPromptToBlockSetTopInputMutation(
    $promptBlockId: UUID!
    $blockSetId: UUID!
  ) {
    addPromptToBlockSetTopInput(
      promptBlockId: $promptBlockId
      blockSetId: $blockSetId
    ) {
      id
    }
  }
`);

const ADD_COMPLETER_TO_BLOCK_SET_MUTATION = gql(`
  mutation AddCompleterToBlockSetMutation(
    $blockSetId: UUID!
    $completerBlockId: UUID!
  ) {
    addCompleterToBlockSet(
      blockSetId: $blockSetId
      completerBlockId: $completerBlockId
    ) {
      id
    }
  }
`);

const ADD_SYSTEM_PROMPT_TO_BLOCK_SET_MUTATION = gql(`
  mutation AddSystemPromptToBlockSetMutation(
    $blockSetId: UUID!
    $promptBlockId: UUID!
  ) {
    addSystemPromptToBlockSet(
      blockSetId: $blockSetId
      promptBlockId: $promptBlockId
    ) {
      id
    }
  }
`);

const ADD_PROMPT_TO_BLOCK_SET_TOP_OUTPUT_MUTATION = gql(`
  mutation AddPromptToBlockSetTopOutputMutation(
    $promptBlockId: UUID!
    $blockSetId: UUID!
  ) {
    addPromptToBlockSetTopOutput(
      promptBlockId: $promptBlockId
      blockSetId: $blockSetId
    ) {
      id
    }
  }
`);

const SWAP_BLOCK_SET_POSITIONS_MUTATION = gql(`
  mutation SwapBlockSetPositionsMutation(
    $blockSetAId: UUID!
    $blockSetBId: UUID!
  ) {
    swapBlockSetPositions(
      blockSetAId: $blockSetAId
      blockSetBId: $blockSetBId
    ) {
      id
    }
  }
`);

export default function Workspace({
  workspaceFragment,
}: {
  workspaceFragment: FragmentType<typeof WORKSPACE_FRAGMENT>;
}) {
  // --- Global State ---

  const setBeingDraggingElementIdState = useSetRecoilState(
    beingDraggingElementIdState
  );
  const [isReorderingBlockSet, setIsReorderingBlockSet] = useRecoilState(
    isReorderingBlockSetState
  );

  // --- GraphQL ---

  const workspace = useFragment(WORKSPACE_FRAGMENT, workspaceFragment);

  const [addPromptToBlockSetTopInput] = useMutation(
    ADD_PROMPT_TO_BLOCK_SET_TOP_INPUT_MUTATION,
    { refetchQueries: ["WorkspaceRouteQuery"] }
  );
  const [addCompleterToBlockSet] = useMutation(
    ADD_COMPLETER_TO_BLOCK_SET_MUTATION,
    { refetchQueries: ["WorkspaceRouteQuery"] }
  );
  const [addSystemPromptToBlockSet] = useMutation(
    ADD_SYSTEM_PROMPT_TO_BLOCK_SET_MUTATION,
    { refetchQueries: ["WorkspaceRouteQuery"] }
  );
  const [addPromptToBlockSetTopOutput] = useMutation(
    ADD_PROMPT_TO_BLOCK_SET_TOP_OUTPUT_MUTATION,
    { refetchQueries: ["WorkspaceRouteQuery"] }
  );
  const [swapBlockSetPositions] = useMutation(
    SWAP_BLOCK_SET_POSITIONS_MUTATION,
    { refetchQueries: ["WorkspaceRouteQuery"] }
  );

  // --- Drag and Drop ---

  const mouseSensor = useSensor(PointerSensor, {
    activationConstraint: {
      distance: 5,
    },
  });
  const sensors = useSensors(mouseSensor);

  const onDragEnd = useCallback(
    ({ active, over }: DragEndEvent) => {
      if (over == null) {
        return;
      }

      if (isReorderingBlockSet) {
        swapBlockSetPositions({
          variables: {
            blockSetAId: (active.id as string).split(":")[1],
            blockSetBId: (over.id as string).split(":")[1],
          },
        });
      } else {
        const [blockType, blockId] = (active.id as string).split(":");
        const [, blockSetId, sectionType] = (over.id as string).split(":");

        switch (sectionType) {
          case "Input":
            addPromptToBlockSetTopInput({
              variables: {
                promptBlockId: blockId,
                blockSetId: blockSetId,
              },
            });
            break;
          case "Completer":
            switch (blockType) {
              case "CompleterBlock":
                addCompleterToBlockSet({
                  variables: {
                    blockSetId: blockSetId,
                    completerBlockId: blockId,
                  },
                });
                break;
              case "PromptBlock":
                addSystemPromptToBlockSet({
                  variables: {
                    blockSetId: blockSetId,
                    promptBlockId: blockId,
                  },
                });
                break;
              default:
                break;
            }
            break;
          case "Output":
            addPromptToBlockSetTopOutput({
              variables: {
                promptBlockId: blockId,
                blockSetId: blockSetId,
              },
            });
            break;
          default:
            break;
        }
      }

      setIsReorderingBlockSet(false);
      setBeingDraggingElementIdState(null);
    },
    [
      isReorderingBlockSet,
      addPromptToBlockSetTopInput,
      addCompleterToBlockSet,
      addSystemPromptToBlockSet,
      addPromptToBlockSetTopOutput,
      setIsReorderingBlockSet,
      setBeingDraggingElementIdState,
      swapBlockSetPositions,
    ]
  );

  // --- Render ---

  return (
    <div className="Workspace">
      <DndContext
        sensors={sensors}
        collisionDetection={isReorderingBlockSet ? closestCenter : undefined}
        onDragStart={(event) => {
          const id = event.active.id as string;
          if (id.split(":")[2] === "Sortable") {
            setIsReorderingBlockSet(true);
          }
          setBeingDraggingElementIdState(event.active.id as string);
        }}
        onDragEnd={onDragEnd}
      >
        <WorkspaceContent workspaceContentFragment={workspace} />
        <CustomDragOverlay />
      </DndContext>
      <Editor />
    </div>
  );
}
