import { spaceContentState } from "../../../state/store";
import { Block, BlockType, SpaceContent } from "../../../static/spaceTypes";
import {
  createInitialSpaceContent,
  createNewBlock,
} from "../../../static/spaceUtils";
import { SPACE_V2_QUERY, UPDATE_SPACE_V2_MUTATION } from "../graphql";
import { useMutation } from "@apollo/client";
import Button from "@mui/joy/Button";
import { append } from "ramda";
import { useCallback } from "react";
import { useRecoilCallback } from "recoil";
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
};

export default function SpaceV2SubHeader(props: Props) {
  const [updateSpaceV2] = useMutation(UPDATE_SPACE_V2_MUTATION, {
    refetchQueries: [SPACE_V2_QUERY],
  });

  const resetSpace = useCallback(() => {
    updateSpaceV2({
      variables: {
        spaceId: props.spaceId,
        content: JSON.stringify(null),
      },
    });
  }, [props.spaceId, updateSpaceV2]);

  const appendBlock = useRecoilCallback(
    ({ snapshot }) =>
      async (block: Block) => {
        let spaceContent = await snapshot.getPromise(spaceContentState);

        if (spaceContent == null) {
          spaceContent = createInitialSpaceContent();
        }

        spaceContent = u<any, SpaceContent>(
          {
            root: {
              blocks: append({ id: block.id }),
            },
            components: {
              [block.id]: u.constant(block),
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
    [props.spaceId, updateSpaceV2]
  );

  return (
    <Container>
      <Left>
        <Button onClick={() => appendBlock(createNewBlock(BlockType.Databag))}>
          Add databag
        </Button>
        <Button
          onClick={() => appendBlock(createNewBlock(BlockType.LlmMessage))}
        >
          Add message
        </Button>
        <Button
          onClick={() => appendBlock(createNewBlock(BlockType.AppendToList))}
        >
          Add append to list
        </Button>
        <Button onClick={() => appendBlock(createNewBlock(BlockType.Llm))}>
          Add LLM
        </Button>
        <Button
          onClick={() => appendBlock(createNewBlock(BlockType.GetAttribute))}
        >
          Add get attribute
        </Button>
        {/* <Button onClick={addGroup}>Add group</Button> */}
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
