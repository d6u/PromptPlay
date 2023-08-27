import {
  useCallback,
  MouseEvent,
  MouseEventHandler,
  ReactElement,
} from "react";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { FragmentType, gql, useFragment } from "../../../__generated__";
import {
  EditorElementType,
  selectedBlockState,
  selectedElementTypeState,
  streamingBlockIdState,
  streamingOutputBlockContentState,
} from "../../../state/store";
import Block, { BlockType, parseBlockDisplayData } from "../../blocks/Block";

const SIMULATOR_BLOCK = gql(`
  fragment SimulatorBlock on Block {
    id
    __typename
    ... on PromptBlock {
      role
      content
    }
    ... on CompleterBlock {
      model
      temperature
      stop
    }
  }
`);

export default function SimulatorBlock({
  className,
  simulatorBlockFragment,
  isFromPrevious = false,
  isSystem = false,
  isRemoveButtonEnabled = false,
  onClickRemove,
}: {
  className?: string;
  simulatorBlockFragment: FragmentType<typeof SIMULATOR_BLOCK>;
  isFromPrevious?: boolean;
  isSystem?: boolean;
  isRemoveButtonEnabled?: boolean;
  onClickRemove?: MouseEventHandler<HTMLDivElement>;
}) {
  // --- Global State ---

  const streamingBlockId = useRecoilValue(streamingBlockIdState);
  const streamingOutputBlockContent = useRecoilValue(
    streamingOutputBlockContentState
  );
  const setSelectedElementTypeState = useSetRecoilState(
    selectedElementTypeState
  );
  const setSelectedBlockState = useSetRecoilState(selectedBlockState);

  // --- GraphQL ---

  const block = useFragment(SIMULATOR_BLOCK, simulatorBlockFragment);

  // --- Render ---

  let type: BlockType;
  let displayContent: ReactElement | string;
  if (block.id === streamingBlockId) {
    type = BlockType.Output;
    displayContent = (
      <>
        ASSISTANT
        <br />
        {streamingOutputBlockContent}
      </>
    );
  } else {
    const data = parseBlockDisplayData(block, isSystem);
    type = data.type;
    displayContent = data.displayContent;
  }

  const onClick = useCallback(
    (event: MouseEvent<HTMLDivElement>) => {
      event.stopPropagation();

      setSelectedElementTypeState(
        block.__typename === "PromptBlock"
          ? EditorElementType.Prompt
          : EditorElementType.Completer
      );
      setSelectedBlockState(block.id);
    },
    [block, setSelectedBlockState, setSelectedElementTypeState]
  );

  return (
    <Block
      blockId={block.id}
      className={className}
      type={type}
      isFromPrevious={isFromPrevious}
      isRemoveButtonEnabled={isRemoveButtonEnabled}
      onClick={isFromPrevious ? null : onClick}
      onClickRemove={onClickRemove}
    >
      {displayContent}
    </Block>
  );
}
