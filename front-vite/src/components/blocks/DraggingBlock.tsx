import { useApolloClient } from "@apollo/client";
import { gql } from "../../__generated__";
import Block, { parseBlockDisplayData } from "./Block";

const DRAGGING_BLOCK_FRAGMENT = gql(`
  fragment DraggingBlock on Block {
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

export default function DraggingBlock({ id }: { id: string }) {
  const client = useApolloClient();

  const block = client.readFragment({
    id: id,
    fragment: DRAGGING_BLOCK_FRAGMENT,
  });

  const { type, displayContent } = parseBlockDisplayData(block);

  return <Block type={type}>{displayContent}</Block>;
}
