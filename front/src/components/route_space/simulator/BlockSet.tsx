import { FragmentType, gql, useFragment } from "../../../__generated__";
import { PromptType } from "../../../__generated__/graphql";
import {
  EditorElementType,
  cursorPositionState,
  isReorderingBlockSetState,
  selectedBlockState,
  selectedElementTypeState,
} from "../../../state/store";
import Block, { BlockType } from "../../blocks/Block";
import "./BlockSet.css";
import BlockSetDragHandle from "./BlockSetDragHandle";
import BlockSetPointer from "./BlockSetPointer";
import SimulatorBlock from "./SimulatorBlock";
import { useMutation } from "@apollo/client";
import { useDroppable } from "@dnd-kit/core";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import classNames from "classnames";
import { ReactElement } from "react";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";

const SIMULATOR_BLOCK_SET_FRAGMENT = gql(`
  fragment SimulatorBlockSet on BlockSet {
    id
    position
    isInputIncludingPreviousBlockSetOutput
    isOutputIncludingInputBlocks
    isRepeatingCurrentBlockSet
    topInputPromptBlock {
      id
      ...SimulatorBlock
    }
    systemPromptBlock {
      id
      ...SimulatorBlock
    }
    completerBlock {
      id
      ...SimulatorBlock
    }
    topOutputBlock {
      id
      ...SimulatorBlock
    }
    previousBlockSetsInputBlocks {
      id
      role
      ...SimulatorBlock
    }
  }
`);

const REMOVE_TOP_INPUT_FROM_BLOCK_SET_MUTATION = gql(`
  mutation RemoveTopInputFromBlockSetMutation(
    $blockSetId: UUID!
  ) {
    removeTopInputFromBlockSet(
      blockSetId: $blockSetId
    ) {
      id
    }
  }
`);

const REMOVE_SYSTEM_PROMPT_FROM_BLOCK_SET_MUTATION = gql(`
  mutation RemoveSystemPromptFromBlockSetMutation(
    $blockSetId: UUID!
  ) {
    removeSystemPromptFromBlockSet(
      blockSetId: $blockSetId
    ) {
      id
    }
  }
`);

const REMOVE_COMPLETER_FROM_BLOCK_SET_MUTATION = gql(`
  mutation RemoveCompleterFromBlockSetMutation(
    $blockSetId: UUID!
  ) {
    removeCompleterFromBlockSet(
      blockSetId: $blockSetId
    ) {
      id
    }
  }
`);

const REMOVE_TOP_OUTPUT_FROM_BLOCK_SET_MUTATION = gql(`
  mutation RemoveTopOutputFromBlockSetMutation(
    $blockSetId: UUID!
  ) {
    removeTopOutputFromBlockSet(
      blockSetId: $blockSetId
    ) {
      id
    }
  }
`);

export default function BlockSet({
  blockSetFragment,
  index = null,
  isDraggingOverlay = false,
}: {
  blockSetFragment: FragmentType<typeof SIMULATOR_BLOCK_SET_FRAGMENT>;
  index?: number | null;
  isDraggingOverlay?: boolean;
}) {
  // --- Global State ---

  const [cursorPosition, setCursorPosition] =
    useRecoilState(cursorPositionState);
  const isReorderingBlockSet = useRecoilValue(isReorderingBlockSetState);

  // --- GraphQL ---

  const blockSet = useFragment(SIMULATOR_BLOCK_SET_FRAGMENT, blockSetFragment);

  const [removeTopInputFromBlockSet] = useMutation(
    REMOVE_TOP_INPUT_FROM_BLOCK_SET_MUTATION,
    {
      refetchQueries: ["WorkspaceRouteQuery"],
    }
  );
  const [removeSystemPromptFromBlockSet] = useMutation(
    REMOVE_SYSTEM_PROMPT_FROM_BLOCK_SET_MUTATION,
    {
      refetchQueries: ["WorkspaceRouteQuery"],
    }
  );
  const [removeCompleterFromBlockSet] = useMutation(
    REMOVE_COMPLETER_FROM_BLOCK_SET_MUTATION,
    {
      refetchQueries: ["WorkspaceRouteQuery"],
    }
  );
  const [removeTopOutputFromBlockSet] = useMutation(
    REMOVE_TOP_OUTPUT_FROM_BLOCK_SET_MUTATION,
    {
      refetchQueries: ["WorkspaceRouteQuery"],
    }
  );

  // --- Sortable ---

  const {
    active,
    attributes,
    listeners,
    setNodeRef: setNodeRefSortable,
    transform,
    transition,
    setActivatorNodeRef,
  } = useSortable({
    id: `BlockSet:${blockSet.id}:Sortable`,
    data: {
      blockSetId: blockSet.id,
    },
  });

  // --- Droppable ---

  const { isOver: isOverInput, setNodeRef: setNodeRefInput } = useDroppable({
    id: `BlockSet:${blockSet.id}:Input`,
    disabled: isReorderingBlockSet,
  });
  const { isOver: isOverCompleter, setNodeRef: setNodeRefCompleter } =
    useDroppable({
      id: `BlockSet:${blockSet.id}:Completer`,
      disabled: isReorderingBlockSet,
    });
  const { isOver: isOverOutput, setNodeRef: setNodeRefOutput } = useDroppable({
    id: `BlockSet:${blockSet.id}:Output`,
    disabled: isReorderingBlockSet,
  });

  // --- State ---

  const setSelectedElementTypeState = useSetRecoilState(
    selectedElementTypeState
  );
  const setSelectedBlockState = useSetRecoilState(selectedBlockState);

  // --- Render ---

  // ----- Input Blocks -----

  const inputBlocks: ReactElement[] = [];

  if (blockSet.topInputPromptBlock) {
    inputBlocks.unshift(
      <SimulatorBlock
        key="current-top-input"
        simulatorBlockFragment={blockSet.topInputPromptBlock}
        isRemoveButtonEnabled={true}
        onClickRemove={(event) => {
          event.stopPropagation();
          removeTopInputFromBlockSet({
            variables: {
              blockSetId: blockSet.id,
            },
          });
        }}
      />
    );
  } else {
    inputBlocks.unshift(
      <Block
        key="current-top-input"
        className={classNames({
          "Block_placeholder-dragable-over": isOverInput,
        })}
        type={BlockType.Placeholder}
      />
    );
  }

  if (blockSet.isInputIncludingPreviousBlockSetOutput) {
    const arr = Array.from(blockSet.previousBlockSetsInputBlocks).reverse();

    for (let i = 0; i < arr.length; i++) {
      if (inputBlocks.length === 3) {
        inputBlocks.shift();

        const block = arr[i - 1];

        inputBlocks.unshift(
          <Block
            key="current-input-more"
            type={
              block.role === PromptType.Assistant
                ? BlockType.Output
                : BlockType.Prompt
            }
            isFromPrevious
          >
            {`+${arr.length - 1}`}
          </Block>
        );
        break;
      }

      const block = arr[i];

      inputBlocks.unshift(
        <SimulatorBlock
          key={block.id}
          simulatorBlockFragment={block}
          isFromPrevious
        />
      );
    }
  }

  // ----- Output Blocks -----

  const outputBlocks: ReactElement[] = [];

  if (blockSet.topOutputBlock) {
    outputBlocks.unshift(
      <SimulatorBlock
        key="current-output"
        simulatorBlockFragment={blockSet.topOutputBlock}
        isRemoveButtonEnabled={true}
        onClickRemove={(event) => {
          event.stopPropagation();
          removeTopOutputFromBlockSet({
            variables: {
              blockSetId: blockSet.id,
            },
          });
        }}
      />
    );
  } else {
    outputBlocks.unshift(
      <Block
        key="current-output"
        className={classNames({
          "Block_placeholder-dragable-over": isOverOutput,
        })}
        type={BlockType.Placeholder}
      />
    );
  }

  if (blockSet.isOutputIncludingInputBlocks) {
    if (blockSet.topInputPromptBlock) {
      outputBlocks.unshift(
        <SimulatorBlock
          key="output-top-input"
          simulatorBlockFragment={blockSet.topInputPromptBlock}
          isFromPrevious
        />
      );
    }

    const arr = Array.from(blockSet.previousBlockSetsInputBlocks).reverse();

    for (let i = 0; i < arr.length; i++) {
      if (outputBlocks.length === 3) {
        outputBlocks.shift();

        const block = arr[i - 1];

        outputBlocks.unshift(
          <Block
            key="current-output-more"
            type={
              block.role === PromptType.Assistant
                ? BlockType.Output
                : BlockType.Prompt
            }
            isFromPrevious
          >
            {`+${arr.length}`}
          </Block>
        );
        break;
      }

      const block = arr[i];

      outputBlocks.unshift(
        <SimulatorBlock
          key={block.id}
          simulatorBlockFragment={block}
          isFromPrevious
        />
      );
    }
  }

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const isMoving = active?.data?.current?.blockSetId === blockSet.id;

  return (
    <div
      className={classNames("BlockSet", {
        BlockSet_is_moving: isMoving,
        BlockSet_is_dragging_overlay: isDraggingOverlay,
      })}
      ref={setNodeRefSortable}
      style={style}
      {...attributes}
    >
      <div className="BlockSet_content">
        <BlockSetPointer
          isActive={index === cursorPosition}
          onClick={() => setCursorPosition(blockSet.position)}
        />
        <div className="BlockSet_input" ref={setNodeRefInput}>
          {inputBlocks}
        </div>
        <div
          className={classNames("BlockSet_completer-setup", {
            "BlockSet_draggable-over": isOverCompleter,
          })}
          ref={setNodeRefCompleter}
          onClick={() => {
            setSelectedElementTypeState(EditorElementType.BlockSet);
            setSelectedBlockState(blockSet.id);
          }}
        >
          {blockSet.systemPromptBlock ? (
            <SimulatorBlock
              className="BlockSet_prompt"
              simulatorBlockFragment={blockSet.systemPromptBlock}
              isSystem
              isRemoveButtonEnabled={true}
              onClickRemove={(event) => {
                event.stopPropagation();
                removeSystemPromptFromBlockSet({
                  variables: {
                    blockSetId: blockSet.id,
                  },
                });
              }}
            />
          ) : (
            <Block
              className={classNames("BlockSet_system-prompt-placeholder", {
                "Block_placeholder-dragable-over": isOverCompleter,
              })}
              type={BlockType.Placeholder}
            />
          )}
          {blockSet.completerBlock ? (
            <SimulatorBlock
              simulatorBlockFragment={blockSet.completerBlock}
              isRemoveButtonEnabled={true}
              onClickRemove={(event) => {
                event.stopPropagation();
                removeCompleterFromBlockSet({
                  variables: {
                    blockSetId: blockSet.id,
                  },
                });
              }}
            />
          ) : (
            <Block type={BlockType.Placeholder} />
          )}
        </div>
        <div className="BlockSet_output" ref={setNodeRefOutput}>
          {outputBlocks}
        </div>
        <BlockSetDragHandle
          handleRef={setActivatorNodeRef}
          handleListeners={listeners}
        />
      </div>
    </div>
  );
}
