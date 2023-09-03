import { useMutation } from "@apollo/client";
import {
  DndContext,
  DragEndEvent,
  useSensor,
  useSensors,
  closestCenter,
  TouchSensor,
  MouseSensor,
  KeyboardSensor,
} from "@dnd-kit/core";
import { useCallback } from "react";
import { useRecoilState, useSetRecoilState } from "recoil";
import { FragmentType, gql, useFragment } from "../../__generated__";
import { swapBlockSets } from "../../state/graphql";
import {
  beingDraggingElementIdState,
  isReorderingBlockSetState,
} from "../../state/store";
import CustomDragOverlay from "../CustomDragOverlay";
import WorkspaceContent from "./WorkspaceContent";
import { WORKSPACE_ROUTE_QUERY } from "./WorkspaceRouteQuery";
import Editor from "./editor/Editor";
import "./Workspace.css";

const WORKSPACE_FRAGMENT = gql(`
  fragment WorkspaceQuery on Query {
    workspace(workspaceId: $workspaceId) {
      firstPreset {
        id
        blockSets {
          id
          position
        }
      }
    }
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
    $movingBlockSetId: UUID!
    $slotBlockSetId: UUID!
  ) {
    swapBlockSetPositions(
      movingBlockSetId: $movingBlockSetId
      slotBlockSetId: $slotBlockSetId
    ) {
      id
      blockSets {
        id
        position
      }
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

  const query = useFragment(WORKSPACE_FRAGMENT, workspaceFragment);

  const [addPromptToBlockSetTopInput] = useMutation(
    ADD_PROMPT_TO_BLOCK_SET_TOP_INPUT_MUTATION,
    { refetchQueries: [WORKSPACE_ROUTE_QUERY] }
  );
  const [addCompleterToBlockSet] = useMutation(
    ADD_COMPLETER_TO_BLOCK_SET_MUTATION,
    { refetchQueries: [WORKSPACE_ROUTE_QUERY] }
  );
  const [addSystemPromptToBlockSet] = useMutation(
    ADD_SYSTEM_PROMPT_TO_BLOCK_SET_MUTATION,
    { refetchQueries: [WORKSPACE_ROUTE_QUERY] }
  );
  const [addPromptToBlockSetTopOutput] = useMutation(
    ADD_PROMPT_TO_BLOCK_SET_TOP_OUTPUT_MUTATION,
    { refetchQueries: [WORKSPACE_ROUTE_QUERY] }
  );
  const [swapBlockSetPositions] = useMutation(
    SWAP_BLOCK_SET_POSITIONS_MUTATION
  );

  // --- Drag and Drop ---

  const onDragEnd = useCallback(
    ({ active, over }: DragEndEvent) => {
      if (over == null) {
        return;
      }

      if (isReorderingBlockSet) {
        const preset = query.workspace?.firstPreset;

        if (preset != null) {
          const movingBlockSetId = (active.id as string).split(":")[1];
          const slotBlockSetId = (over.id as string).split(":")[1];

          const newBlocksSets = swapBlockSets(
            preset.blockSets,
            movingBlockSetId,
            slotBlockSetId
          );

          if (newBlocksSets != null) {
            swapBlockSetPositions({
              variables: { movingBlockSetId, slotBlockSetId },
              optimisticResponse: {
                swapBlockSetPositions: {
                  id: preset.id,
                  __typename: "Preset",
                  blockSets: newBlocksSets,
                },
              },
            });
          }
        }
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
      query.workspace?.firstPreset,
      addPromptToBlockSetTopInput,
      addCompleterToBlockSet,
      addSystemPromptToBlockSet,
      addPromptToBlockSetTopOutput,
      setIsReorderingBlockSet,
      setBeingDraggingElementIdState,
      swapBlockSetPositions,
    ]
  );

  const mouseSensor = useSensor(MouseSensor, {
    // Require the mouse to move by 10 pixels before activating
    activationConstraint: {
      distance: 5,
    },
  });
  const touchSensor = useSensor(TouchSensor, {
    // Press delay of 250ms, with tolerance of 5px of movement
    activationConstraint: {
      delay: 250,
      tolerance: 5,
    },
  });
  const keyboardSensor = useSensor(KeyboardSensor);

  const sensors = useSensors(mouseSensor, touchSensor, keyboardSensor);

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
        <WorkspaceContent workspaceContentFragment={query} />
        <CustomDragOverlay />
      </DndContext>
      <Editor />
    </div>
  );
}
