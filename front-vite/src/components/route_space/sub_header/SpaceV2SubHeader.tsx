import Button from "@mui/joy/Button";
import Input from "@mui/joy/Input";
import { append } from "ramda";
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import u from "updeep";
import { useMutation } from "urql";
import { FragmentType, graphql, useFragment } from "../../../gql";
import {
  DELETE_SPACE_MUTATION,
  UPDATE_SPACE_NAME_MUTATION,
} from "../../../state/spaceGraphQl";
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
  justify-content: space-between;
  padding: 0 20px;
  flex-shrink: 0;
  align-items: stretch;
`;

const Left = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const Right = styled(Left)``;

const Center = styled.div`
  flex-grow: 1;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const SpaceNameInput = styled(Input)`
  width: 250px;
`;

const SpaceName = styled.div`
  font-size: 14px;
  padding-left: 9px;
`;

const SPACE_SUB_HEADER_FRAGMENT = graphql(`
  fragment SpaceSubHeaderFragment on Space {
    name
  }
`);

type Props = {
  spaceSubHeaderFragment?: FragmentType<typeof SPACE_SUB_HEADER_FRAGMENT>;
  isReadOnly: boolean;
  spaceId: string;
  spaceContent: SpaceContent | null;
  onSpaceContentChange: (spaceContent: SpaceContent | null) => void;
  onExecuteVisualChain: () => void;
  isExecuting: boolean;
};

export default function SpaceV2SubHeader(props: Props) {
  const navigate = useNavigate();

  const spaceSubHeader = useFragment(
    SPACE_SUB_HEADER_FRAGMENT,
    props.spaceSubHeaderFragment
  );

  const [, deleteSpace] = useMutation(DELETE_SPACE_MUTATION);

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

  const [name, setName] = useState<string>(spaceSubHeader?.name ?? "");

  useEffect(() => {
    setName(spaceSubHeader?.name ?? "");
  }, [spaceSubHeader?.name]);

  const currentNameRef = useRef<string>(name);
  const [isEditingName, setIsEditingName] = useState<boolean>(false);
  const [, updateSpaceName] = useMutation(UPDATE_SPACE_NAME_MUTATION);
  const [isComposing, setIsComposing] = useState<boolean>(false);

  const [runButtonLabelForExecutingState, setRunButtonLabelForExecutingState] =
    useState<string>("Running...");

  // Display a funny animation on Run button when executing the prompt chain
  useEffect(() => {
    if (!props.isExecuting) {
      return;
    }

    const intervalId = setInterval(() => {
      setRunButtonLabelForExecutingState((label) => {
        const len = label.length;
        return label[len - 1] + label.slice(0, len - 1);
      });
    }, 200);

    return () => {
      clearInterval(intervalId);
    };
  }, [props.isExecuting]);

  return (
    <Container>
      {props.isReadOnly ? (
        <Center>
          <SpaceName>{name}</SpaceName>
        </Center>
      ) : (
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
            <Button size="sm" onClick={() => appendNewBlock(BlockType.Parser)}>
              + Parser
            </Button>
            <Button
              color="success"
              size="sm"
              variant="outlined"
              disabled={props.spaceContent == null || props.isExecuting}
              onClick={() => props.onExecuteVisualChain()}
            >
              {props.isExecuting ? runButtonLabelForExecutingState : "Run"}
            </Button>
            {isEditingName ? (
              <SpaceNameInput
                ref={(element) => {
                  element?.querySelector("input")?.focus();
                }}
                type="text"
                size="sm"
                placeholder="Enter a name for this space"
                value={name}
                onChange={(e) => setName(e.target.value)}
                // This for handling IME (Input Method Editors) input,
                // e.g. Pinyin input. Using this technique to avoid triggering
                // the Enter key when user is still interacting with IME.
                onCompositionStart={() => setIsComposing(true)}
                onCompositionEnd={() => setIsComposing(false)}
                onKeyDown={(e) => {
                  if (isComposing) {
                    return;
                  }

                  if (e.key === "Enter") {
                    setIsEditingName(false);
                    updateSpaceName({
                      spaceId: props.spaceId,
                      name,
                    });
                  } else if (e.key === "Escape") {
                    setIsEditingName(false);
                    setName(currentNameRef.current);
                  }
                }}
              />
            ) : (
              <SpaceName
                onClick={() => {
                  currentNameRef.current = name;
                  setIsEditingName(true);
                }}
              >
                {name}
              </SpaceName>
            )}
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
                    spaceId: props.spaceId,
                  }).then(({ error, data }) => {
                    if (error || !data?.result) {
                      console.error(error);
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
