import { useApolloClient, useMutation } from "@apollo/client";
import FormControl from "@mui/joy/FormControl";
import FormLabel from "@mui/joy/FormLabel";
import Radio from "@mui/joy/Radio";
import RadioGroup from "@mui/joy/RadioGroup";
import { useEffect, useState } from "react";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { gql } from "../../../__generated__";
import { PromptType } from "../../../__generated__/graphql";
import {
  selectedBlockState,
  selectedElementTypeState,
  streamingBlockIdState,
  streamingOutputBlockContentState,
} from "../../../state/store";
import EditorHeader from "./EditorHeader";

const SELECTED_BLOCK_FRAGMENT = gql(`
  fragment SelectedBlock on PromptBlock {
    id
    role
    content
  }
`);

const DELETE_BLOCK_MUTATION = gql(`
  mutation DeletePromptBlockMutation(
    $blockId: UUID!
  ) {
    deleteBlock(
      blockId: $blockId
    ) {
      isSuccess
    }
  }
`);

const UPDATE_BLOCK_MUTATION = gql(`
  mutation UpdateBlockMutation(
    $id: UUID!
    $role: PromptType!
    $content: String!
  ) {
    updatePromptBlock(
      id: $id
      role: $role
      content: $content
    ) {
      id
    }
  }
`);

export default function PromptBlockEditor() {
  // --- Global State ---

  const setSelectedElementType = useSetRecoilState(selectedElementTypeState);
  const selectedBlockId = useRecoilValue(selectedBlockState);
  const streamingBlockId = useRecoilValue(streamingBlockIdState);
  const streamingOutputBlockContent = useRecoilValue(
    streamingOutputBlockContentState
  );

  // --- GraphQL ---

  const client = useApolloClient();

  const result = client.readFragment({
    id: `PromptBlock:${selectedBlockId}`,
    fragment: SELECTED_BLOCK_FRAGMENT,
  });

  const [deleteBlock] = useMutation(DELETE_BLOCK_MUTATION, {
    refetchQueries: ["WorkspaceRouteQuery"],
  });
  const [updateBlock] = useMutation(UPDATE_BLOCK_MUTATION, {
    refetchQueries: ["WorkspaceRouteQuery"],
  });

  // --- State ---

  const [content, setContent] = useState<string>(result?.content ?? "");
  const [role, setRole] = useState<PromptType | null>(result?.role ?? null);

  useEffect(() => {
    setContent(result?.content ?? "");
    setRole(result?.role ?? null);
  }, [result]);

  const isCurrentBlockContentStreaming = result?.id === streamingBlockId;
  const blockContent = isCurrentBlockContentStreaming
    ? streamingOutputBlockContent
    : content;

  if (result == null) {
    return null;
  }

  return (
    <>
      <EditorHeader
        title="Prompt"
        buttonItems={[
          {
            title: "Save",
            onClick: () => {
              updateBlock({
                variables: {
                  id: result.id,
                  role: role ?? result.role,
                  content,
                },
              });
            },
          },
          {
            title: "Delete",
            onClick: () => {
              deleteBlock({ variables: { blockId: result.id } }).then(
                ({ errors, data }) => {
                  if (errors || !data?.deleteBlock?.isSuccess !== true) {
                    console.error(errors);
                    return;
                  }

                  setSelectedElementType(null);
                }
              );
            },
          },
        ]}
      />
      <FormControl className="Editor_input_block">
        <FormLabel>Role</FormLabel>
        <RadioGroup
          value={role}
          onChange={(event) => {
            setRole(event.target.value as PromptType);
          }}
          name="block-set-output-option"
          orientation="horizontal"
        >
          <Radio value="User" label="User" />
          <Radio value="Assistant" label="Assistant" />
        </RadioGroup>
      </FormControl>
      <FormControl className="Editor_textarea">
        <FormLabel>Content</FormLabel>
        <textarea
          className="Editor_textarea"
          value={blockContent}
          onChange={(event) => {
            setContent(event.target.value);
          }}
          disabled={isCurrentBlockContentStreaming}
        />
      </FormControl>
    </>
  );
}
