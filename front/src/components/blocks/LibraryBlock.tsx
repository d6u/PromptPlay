import { useDraggable } from "@dnd-kit/core";
import { FragmentType, gql, useFragment } from "../../__generated__";
import Block, { parseBlockDisplayData } from "./Block";

const LIBRARY_BLOCK = gql(`
  fragment LibraryBlock on Block {
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

export default function LibraryBlock({
  className,
  libraryBlockFragment,
  onClick,
}: {
  className?: string;
  libraryBlockFragment: FragmentType<typeof LIBRARY_BLOCK>;
  onClick?: () => void;
}) {
  const block = useFragment(LIBRARY_BLOCK, libraryBlockFragment);

  const { attributes, listeners, setNodeRef } = useDraggable({
    // Must match the ID format with the ID format used by Apollo Client,
    // so that we can easily load the data from the cache in DraggingBlock.
    id: `${block.__typename}:${block.id}`,
  });

  const { type, displayContent } = parseBlockDisplayData(block);

  return (
    <Block
      blockId={block.id}
      ref={setNodeRef}
      className={className}
      type={type}
      onClick={onClick}
      {...listeners}
      {...attributes}
    >
      {displayContent}
    </Block>
  );
}
