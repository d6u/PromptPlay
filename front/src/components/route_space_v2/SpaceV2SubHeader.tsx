import { SPACE_V2_QUERY, UPDATE_SPACE_V2_MUTATION } from "./graphql";
import {
  Block,
  BlockGroupType,
  BlockType,
  ROOT_COMPONENT_ID,
  SpaceContent,
} from "./interfaces";
import { useMutation } from "@apollo/client";
import Button from "@mui/joy/Button";
import { nanoid } from "nanoid";
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
  content: SpaceContent | null;
};

export default function SpaceV2SubHeader({ spaceId, content }: Props) {
  const [updateSpaceV2] = useMutation(UPDATE_SPACE_V2_MUTATION, {
    refetchQueries: [SPACE_V2_QUERY],
  });

  const resetSpace = useCallback(() => {
    updateSpaceV2({
      variables: {
        spaceId,
        content: JSON.stringify(null),
      },
    });
  }, [spaceId, updateSpaceV2]);

  const appendBlock = useCallback(
    (block: Block) => {
      let newContent = content;

      if (newContent == null) {
        newContent = {
          root: {
            id: ROOT_COMPONENT_ID,
            blocks: [],
          },
          components: {
            [ROOT_COMPONENT_ID]: {
              id: ROOT_COMPONENT_ID,
              type: BlockGroupType.Root,
              blocks: [],
            },
          },
        };
      }

      newContent = u<any, SpaceContent>(
        {
          root: {
            blocks: append({
              id: block.id,
            }),
          },
          components: {
            [block.id]: u.constant(block),
          },
        },
        newContent
      ) as SpaceContent;

      updateSpaceV2({
        variables: {
          spaceId,
          content: JSON.stringify(newContent),
        },
      });
    },
    [content, spaceId, updateSpaceV2]
  );

  // const addGroup = useCallback(() => {
  //   let newContent: BlockGroup;
  //   if (content == null) {
  //     newContent = {
  //       id: nanoid(),
  //       type: "root",
  //       blocks: [],
  //     };
  //   } else {
  //     newContent = { ...content };
  //   }

  //   newContent.blocks.push({
  //     id: nanoid(),
  //     type: "repeat",
  //     blocks: [
  //       {
  //         id: nanoid(),
  //         type: BlockType.Databag,
  //         input: {
  //           messages: "messages",
  //           message: "message",
  //         },
  //         code: null,
  //         output: {
  //           messages: "messages",
  //           message: "message",
  //         },
  //       },
  //     ],
  //   });

  //   updateSpaceV2({
  //     variables: {
  //       spaceId,
  //       content: JSON.stringify(newContent),
  //     },
  //   });
  // }, [content, spaceId, updateSpaceV2]);

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

function createNewBlock(type: BlockType): Block {
  return {
    id: nanoid(),
    type,
    input: {
      scope_name: "argument_name",
    },
    code: null,
    output: {
      return_name: "scope_name",
    },
  };
}
