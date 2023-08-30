import { useMutation } from "@apollo/client";
import Button from "@mui/joy/Button";
import { append } from "ramda";
import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import u from "updeep";
import { DELETE_SPACE_MUTATION } from "../../../state/spaceGraphQl";
import { ROOT_PATH } from "../../../static/routeConfigs";
import { BlockType, SpaceContent } from "../../../static/spaceTypes";
import {
  createInitialSpaceContent,
  createNewBlock,
} from "../../../static/spaceUtils";

const Container = styled.div`
  height: 51px;
  border-bottom: 1px solid #ececf1;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  padding: 0 20px;
  flex-shrink: 0;
  align-items: stretch;
`;

const Left = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 10px;
`;

const Right = styled(Left)``;

type Props = {
  isReadOnly: boolean;
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
      {props.isReadOnly ? null : (
        <>
          <Left>
            <Button size="sm" onClick={() => appendNewBlock(BlockType.Databag)}>
              + Databag
            </Button>
            <Button
              size="sm"
              onClick={() => appendNewBlock(BlockType.LlmMessage)}
            >
              + Message
            </Button>
            <Button
              size="sm"
              onClick={() => appendNewBlock(BlockType.AppendToList)}
            >
              + Append to List
            </Button>
            <Button size="sm" onClick={() => appendNewBlock(BlockType.Llm)}>
              + LLM
            </Button>
            <Button
              size="sm"
              onClick={() => appendNewBlock(BlockType.GetAttribute)}
            >
              + Get Attribute
            </Button>
            <Button
              color="success"
              size="sm"
              variant="outlined"
              disabled={props.spaceContent == null}
              onClick={() => props.onExecuteVisualChain()}
            >
              Run
            </Button>
          </Left>
          <Right>
            <Button
              size="sm"
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
              size="sm"
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
        </>
      )}
    </Container>
  );
}
