import { useMutation } from "@apollo/client";
import Button from "@mui/joy/Button";
import { append } from "ramda";
import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import u from "updeep";
import { DELETE_SPACE_MUTATION } from "../../../state/spaceGraphQl";
import { BlockType, SpaceContent } from "../../../static/spaceTypes";
import {
  createInitialSpaceContent,
  createNewBlock,
} from "../../../static/spaceUtils";
import { ROOT_PATH } from "../../routeConfig";

const Container = styled.div`
  height: 60px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 0 10px;
  border-bottom: 1px solid #ececf1;
  flex-shrink: 0;
`;

const Left = styled.div`
  display: flex;
  flex-direction: row;
  gap: 10px;
`;

const Right = styled.div`
  display: flex;
  flex-direction: row;
  gap: 10px;
`;

type Props = {
  spaceId: string;
  spaceContent: SpaceContent | null;
  onSpaceContentChange: (spaceContent: SpaceContent | null) => void;
  onExecuteVisualChain: () => void;
};

export default function SpaceV2SubHeader(props: Props) {
  const navigate = useNavigate();

  const [deleteSpace] = useMutation(DELETE_SPACE_MUTATION);

  const appendNewBlock = useCallback(
    (blockType: BlockType) => {
      let spaceContent = props.spaceContent;

      if (spaceContent == null) {
        spaceContent = createInitialSpaceContent();
      }

      const newBlock = createNewBlock(blockType);

      spaceContent = u({
        root: {
          blocks: append({ id: newBlock.id }),
        },
        components: {
          [newBlock.id]: u.constant(newBlock),
        },
      })(spaceContent) as SpaceContent;

      props.onSpaceContentChange(spaceContent);
    },
    [props]
  );

  return (
    <Container>
      <Left>
        <Button onClick={() => appendNewBlock(BlockType.Databag)}>
          + Databag
        </Button>
        <Button onClick={() => appendNewBlock(BlockType.LlmMessage)}>
          + Message
        </Button>
        <Button onClick={() => appendNewBlock(BlockType.AppendToList)}>
          + Append to List
        </Button>
        <Button onClick={() => appendNewBlock(BlockType.Llm)}>+ LLM</Button>
        <Button onClick={() => appendNewBlock(BlockType.GetAttribute)}>
          + Get Attribute
        </Button>
        <Button
          color="success"
          size="md"
          variant="outlined"
          disabled={props.spaceContent == null}
          onClick={() => props.onExecuteVisualChain()}
        >
          Run
        </Button>
      </Left>
      <Right>
        <Button
          onClick={() => {
            const isConfirmed = window.confirm(
              "⚠️ Unrecoverable action. ⚠️\nReset is unrecoverable. Are you sure?"
            );

            if (isConfirmed) {
              props.onSpaceContentChange(null);
            }
          }}
        >
          Reset Space
        </Button>
        <Button
          variant="outlined"
          onClick={() => {
            const isConfirmed = window.confirm(
              "⚠️ Unrecoverable action. ⚠️\nDelet is unrecoverable. Are you sure?"
            );

            if (isConfirmed) {
              deleteSpace({
                variables: {
                  spaceId: props.spaceId,
                },
              }).then(({ errors, data }) => {
                if (errors || !data?.result) {
                  console.error(errors);
                  return;
                }

                navigate(ROOT_PATH);
              });
            }
          }}
        >
          Delete Space
        </Button>
      </Right>
    </Container>
  );
}
