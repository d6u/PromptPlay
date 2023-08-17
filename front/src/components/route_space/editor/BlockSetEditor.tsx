import { gql } from "../../../__generated__";
import {
  selectedBlockState,
  selectedElementTypeState,
} from "../../../state/store";
import EditorHeader from "./EditorHeader";
import { useApolloClient, useMutation } from "@apollo/client";
import { RadioGroup, Radio, FormLabel, FormControl, Checkbox } from "@mui/joy";
import { useEffect, useState } from "react";
import { useRecoilValue, useSetRecoilState } from "recoil";

const EDITOR_BLOCK_SET_FRAGMENT = gql(`
  fragment EditorBlockSet on BlockSet {
    id
    isInputIncludingPreviousBlockSetOutput
    isOutputIncludingInputBlocks
    isRepeatingCurrentBlockSet
  }
`);

const UPDATE_BLOCK_SET_OPTIONS_MUTATION = gql(`
  mutation UpdateBlockSetOptionsMutation(
    $blockSetId: UUID!
    $isInputIncludingPreviousBlockSetOutput: Boolean!
    $isOutputIncludingInputBlocks: Boolean!
    $isRepeatingCurrentBlockSet: Boolean!
  ) {
    updateBlockSetOptions(
      blockSetId: $blockSetId
      isInputIncludingPreviousBlockSetOutput: $isInputIncludingPreviousBlockSetOutput
      isOutputIncludingInputBlocks: $isOutputIncludingInputBlocks
      isRepeatingCurrentBlockSet: $isRepeatingCurrentBlockSet
    ) {
      id
    }
  }
`);

const DELETE_BLOCK_SET_MUTATION = gql(`
  mutation DeleteBlockSetMutation(
    $blockSetId: UUID!
  ) {
    deleteBlockSet(
      blockSetId: $blockSetId
    ) {
      isSuccess
    }
  }
`);

export default function BlockSetEditor() {
  // --- Global State ---

  const selectedBlockId = useRecoilValue(selectedBlockState);
  const setSelectedElementType = useSetRecoilState(selectedElementTypeState);

  // --- GraphQL ---

  const client = useApolloClient();

  const blockSet = client.readFragment({
    id: `BlockSet:${selectedBlockId}`,
    fragment: EDITOR_BLOCK_SET_FRAGMENT,
  });

  const [updateBlockSetOptions] = useMutation(
    UPDATE_BLOCK_SET_OPTIONS_MUTATION,
    { refetchQueries: ["WorkspaceRouteQuery"] }
  );
  const [deleteBlockSet] = useMutation(DELETE_BLOCK_SET_MUTATION, {
    refetchQueries: ["WorkspaceRouteQuery"],
  });

  // --- State ---

  const [
    isInputIncludingPreviousBlockSetOutput,
    setIsInputIncludingPreviousBlockSetOutput,
  ] = useState<boolean>(
    blockSet?.isInputIncludingPreviousBlockSetOutput ?? false
  );
  const [isOutputIncludingInputBlocks, setIsOutputIncludingInputBlocks] =
    useState<boolean>(blockSet?.isOutputIncludingInputBlocks ?? false);
  const [isRepeatingCurrentBlockSet, setIsRepeatingCurrentBlockSet] =
    useState<boolean>(blockSet?.isRepeatingCurrentBlockSet ?? false);

  useEffect(() => {
    setIsInputIncludingPreviousBlockSetOutput(
      blockSet?.isInputIncludingPreviousBlockSetOutput ?? false
    );
    setIsOutputIncludingInputBlocks(
      blockSet?.isOutputIncludingInputBlocks ?? false
    );
    setIsRepeatingCurrentBlockSet(
      blockSet?.isRepeatingCurrentBlockSet ?? false
    );
  }, [blockSet]);

  if (blockSet == null) {
    return null;
  }

  return (
    <>
      <EditorHeader
        title="Block Set"
        buttonItems={[
          {
            title: "Save",
            onClick: () => {
              updateBlockSetOptions({
                variables: {
                  blockSetId: blockSet.id,
                  isInputIncludingPreviousBlockSetOutput,
                  isOutputIncludingInputBlocks,
                  isRepeatingCurrentBlockSet,
                },
              });
            },
          },
          {
            title: "Delete",
            onClick: () => {
              deleteBlockSet({ variables: { blockSetId: blockSet.id } }).then(
                ({ errors, data }) => {
                  if (errors || data?.deleteBlockSet?.isSuccess !== true) {
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
      <div className="Editor_body-block-set">
        <FormControl className="Editor_input_block">
          <FormLabel>Input</FormLabel>
          <RadioGroup
            value={
              isInputIncludingPreviousBlockSetOutput ? "include" : "exclude"
            }
            onChange={(event) => {
              setIsInputIncludingPreviousBlockSetOutput(
                event.target.value === "include"
              );
            }}
            name="block-set-input-option"
          >
            <Radio
              value="include"
              label="Include previous blockset's output"
              color="neutral"
              size="md"
              variant="outlined"
            />
            <Radio
              value="exclude"
              label="Don't include previous blockset's output"
              color="neutral"
              size="md"
              variant="outlined"
            />
          </RadioGroup>
        </FormControl>
        <FormControl className="Editor_input_block">
          <FormLabel>Output</FormLabel>
          <RadioGroup
            value={isOutputIncludingInputBlocks ? "all" : "assistant"}
            onChange={(event) => {
              setIsOutputIncludingInputBlocks(event.target.value === "all");
            }}
            name="block-set-output-option"
          >
            <Radio
              value="assistant"
              label="Assistant message only"
              color="neutral"
              size="md"
              variant="outlined"
            />
            <Radio
              value="all"
              label="Include input message with assistant message"
              color="neutral"
              size="md"
              variant="outlined"
            />
          </RadioGroup>
        </FormControl>
        <FormControl className="Editor_input_block">
          <FormLabel>Repeating</FormLabel>
          <Checkbox
            checked={isRepeatingCurrentBlockSet}
            onChange={(event) => {
              setIsRepeatingCurrentBlockSet(event.target.checked);
            }}
            name="block-set-repeat-option"
            label="Repeat"
            color="neutral"
          />
        </FormControl>
      </div>
    </>
  );
}
