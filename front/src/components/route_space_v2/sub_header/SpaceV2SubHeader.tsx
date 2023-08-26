import { execute } from "../../../llm/chainExecutor";
import { UPDATE_SPACE_V2_MUTATION } from "../../../state/spaceGraphQl";
import {
  missingOpenAiApiKeyState,
  openAiApiKeyState,
  spaceV2SelectedBlockIdState,
} from "../../../state/store";
import { BlockType, SpaceContent } from "../../../static/spaceTypes";
import {
  createInitialSpaceContent,
  createNewBlock,
  validate,
} from "../../../static/spaceUtils";
import { useMutation } from "@apollo/client";
import Button from "@mui/joy/Button";
import { append } from "ramda";
import { useCallback } from "react";
import { useRecoilValue, useSetRecoilState } from "recoil";
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

const Right = styled.div`
  display: flex;
  flex-direction: row;
  gap: 10px;
`;

type Props = {
  spaceId: string;
  spaceContent: SpaceContent | null;
};

export default function SpaceV2SubHeader(props: Props) {
  const openAiApiKey = useRecoilValue(openAiApiKeyState);
  const setMissingOpenAiApiKey = useSetRecoilState(missingOpenAiApiKeyState);
  const setSpaceV2SelectedBlockId = useSetRecoilState(
    spaceV2SelectedBlockIdState
  );

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
        <Button onClick={() => appendNewBlock(BlockType.GetAttribute)}>
          + Get Attribute
        </Button>
        <Button
          color="success"
          size="md"
          variant="outlined"
          disabled={props.spaceContent == null}
          onClick={() => {
            const spaceContent = props.spaceContent!;

            // TODO: Find a better way to do validation
            for (const block of Object.values(spaceContent.components)) {
              if (block.type === BlockType.Llm) {
                if (openAiApiKey == null || openAiApiKey === "") {
                  setSpaceV2SelectedBlockId(block.id);
                  setMissingOpenAiApiKey(true);
                  return;
                }
              }
            }

            // TODO: Make it actually validate someting
            validate(spaceContent);

            execute(spaceContent, openAiApiKey, (block) => {
              let newSpaceContent = spaceContent;

              newSpaceContent = u({
                components: {
                  [block.id]: u.constant(block),
                },
              })(spaceContent) as SpaceContent;

              updateSpaceV2({
                variables: {
                  spaceId: props.spaceId,
                  content: JSON.stringify(newSpaceContent),
                },
              });
            });
          }}
        >
          Run
        </Button>
      </Left>
      <Right>
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
      </Right>
    </Container>
  );
}
