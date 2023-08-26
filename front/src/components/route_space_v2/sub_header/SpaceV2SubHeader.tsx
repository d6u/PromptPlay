import { UPDATE_SPACE_V2_MUTATION } from "../../../state/spaceGraphQl";
import { BlockType, SpaceContent } from "../../../static/spaceTypes";
import {
  createInitialSpaceContent,
  createNewBlock,
} from "../../../static/spaceUtils";
import { useMutation } from "@apollo/client";
import Button from "@mui/joy/Button";
import { append } from "ramda";
import { useCallback } from "react";
import styled from "styled-components";
import u from "updeep";

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

type Props = {
  spaceId: string;
  spaceContent: SpaceContent | null;
};

export default function SpaceV2SubHeader(props: Props) {
  const [updateSpaceV2] = useMutation(UPDATE_SPACE_V2_MUTATION);

  const resetSpace = useCallback(() => {
    updateSpaceV2({
      variables: {
        spaceId: props.spaceId,
        content: JSON.stringify(null),
      },
    });
  }, [props.spaceId, updateSpaceV2]);

  const appendNewBlock = useCallback(
    (blockType: BlockType) => {
      let spaceContent = props.spaceContent;

      if (spaceContent == null) {
        spaceContent = createInitialSpaceContent();
      }

      const newBlock = createNewBlock(blockType);

      spaceContent = u<any, SpaceContent>(
        {
          root: {
            blocks: append({ id: newBlock.id }),
          },
          components: {
            [newBlock.id]: u.constant(newBlock),
          },
        },
        spaceContent
      ) as SpaceContent;

      updateSpaceV2({
        variables: {
          spaceId: props.spaceId,
          content: JSON.stringify(spaceContent),
        },
      });
    },
    [props.spaceId, props.spaceContent, updateSpaceV2]
  );

  return (
    <Container>
      <Left>
        <Button onClick={() => appendNewBlock(BlockType.Databag)}>
          Add databag
        </Button>
        <Button onClick={() => appendNewBlock(BlockType.LlmMessage)}>
          Add message
        </Button>
        <Button onClick={() => appendNewBlock(BlockType.AppendToList)}>
          Add append to list
        </Button>
        <Button onClick={() => appendNewBlock(BlockType.Llm)}>Add LLM</Button>
        <Button onClick={() => appendNewBlock(BlockType.GetAttribute)}>
          Add get attribute
        </Button>
      </Left>
      <div>
        <Button onClick={resetSpace}>Reset space</Button>
        <Button
          variant="outlined"
          onClick={() => {
            const isConfirmed = window.confirm(
              "⚠️ Unrecoverable action. ⚠️\nDeleting this space is unrecoverable. Are you sure?"
            );
            if (isConfirmed) {
              // deleteSpace({
              //   variables: {
              //     workspaceId,
              //   },
              // }).then(({ errors, data }) => {
              //   if (errors || data?.deleteSpace?.isSuccess !== true) {
              //     console.error(errors);
              //     return;
              //   }
              //   setLocation("/");
              // });
            }
          }}
        >
          Delete space
        </Button>
      </div>
    </Container>
  );
}
