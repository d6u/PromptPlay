import { FragmentType, gql, useFragment } from "../../__generated__";
import {
  beingDraggingElementIdState,
  isReorderingBlockSetState,
} from "../../state/store";
import CustomDragOverlay from "../CustomDragOverlay";
import "./Workspace.css";
import WorkspaceContent from "./WorkspaceContent";
import { PRESET_FRAGMENT, WORKSPACE_ROUTE_QUERY } from "./WorkspaceRouteQuery";
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
    workspace(workspaceId: $workspaceId) {
      firstPreset {
        id
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
    SWAP_BLOCK_SET_POSITIONS_MUTATION,
    {
      refetchQueries: [WORKSPACE_ROUTE_QUERY],
      update(cache, { data }) {
        if (data == null) {
          console.error("data is null");
          return;
        }

        const blockSetAId = data.swapBlockSetPositions[0].id;
        const blockSetBId = data.swapBlockSetPositions[1].id;

        if (query.workspace?.firstPreset?.id == null) {
          console.error("preset id is null");
          return;
        }

        const preset = cache.readFragment({
          id: `Preset:${query.workspace.firstPreset.id}`,
          fragment: PRESET_FRAGMENT,
        });

        if (preset == null) {
          console.error("cannot find preset");
          return;
        }

        let blockSetAIndex = preset.blockSets.findIndex(
          ({ id }) => id === blockSetAId
        );

        let blockSetBIndex = preset.blockSets.findIndex(
          ({ id }) => id === blockSetBId
        );

        if (blockSetAIndex > blockSetBIndex) {
          const temp = blockSetAIndex;
          blockSetAIndex = blockSetBIndex;
          blockSetBIndex = temp;
        }

        const partA = preset.blockSets.slice(0, blockSetAIndex);
        const partB = preset.blockSets.slice(
          blockSetAIndex + 1,
          blockSetBIndex
        );
        const partC = preset.blockSets.slice(blockSetBIndex + 1);

        const newPreset = {
          ...preset,
          blockSets: [
            ...partA,
            preset.blockSets[blockSetBIndex],
            ...partB,
            preset.blockSets[blockSetAIndex],
            ...partC,
          ],
        };

        cache.writeFragment({
          id: `Preset:${query.workspace.firstPreset.id}`,
          fragment: PRESET_FRAGMENT,
          data: newPreset,
        });
      },
    }
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
        const blockSetAId = (active.id as string).split(":")[1];
        const blockSetBId = (over.id as string).split(":")[1];

        console.log({ blockSetAId, blockSetBId });

        swapBlockSetPositions({
          variables: {
            blockSetAId,
            blockSetBId,
          },
          optimisticResponse: {
            swapBlockSetPositions: [
              {
                __typename: "BlockSet",
                id: blockSetBId,
              },
              {
                __typename: "BlockSet",
                id: blockSetAId,
              },
            ],
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
        <WorkspaceContent workspaceContentFragment={query} />
        <CustomDragOverlay />
      </DndContext>
      <Editor />
    </div>
  );
}
