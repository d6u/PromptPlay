import { BlockType } from "../block_v2/BlockV2";
import "./SpaceV2SubHeader.css";
import { UPDATE_SPACE_V2_MUTATION } from "./graphql";
import { Block, BlockGroup } from "./utils";
import { useMutation } from "@apollo/client";
import Button from "@mui/joy/Button";
import { nanoid } from "nanoid";
import { useCallback } from "react";

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

export default function SpaceV2SubHeader({
  spaceId,
  content,
}: {
  spaceId: string;
  content: BlockGroup | null;
}) {
  const [updateSpaceV2] = useMutation(UPDATE_SPACE_V2_MUTATION);

  const resetSpace = useCallback(() => {
    const newContent = {
      id: nanoid(),
      type: "root",
      blocks: [],
    };

    updateSpaceV2({
      variables: {
        spaceId,
        content: JSON.stringify(newContent),
      },
    });
  }, [spaceId, updateSpaceV2]);

  const addDatabag = useCallback(
    (block: Block) => {
      let newContent: BlockGroup;
      if (content == null) {
        newContent = {
          id: nanoid(),
          type: "root",
          blocks: [],
        };
      } else {
        newContent = { ...content };
      }

      newContent.blocks.push(block);

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
    <div className="SpaceV2SubHeader">
      <div className="SpaceV2SubHeader_left">
        <Button onClick={() => addDatabag(createNewBlock(BlockType.Databag))}>
          Add databag
        </Button>
        <Button
          onClick={() => addDatabag(createNewBlock(BlockType.LlmMessage))}
        >
          Add message
        </Button>
        <Button
          onClick={() => addDatabag(createNewBlock(BlockType.AppendToList))}
        >
          Add append to list
        </Button>
        <Button onClick={() => addDatabag(createNewBlock(BlockType.Llm))}>
          Add LLM
        </Button>
        <Button
          onClick={() => addDatabag(createNewBlock(BlockType.GetAttribute))}
        >
          Add get attribute
        </Button>
        {/* <Button onClick={addGroup}>Add group</Button> */}
      </div>
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
    </div>
  );
}