import { useApolloClient, useMutation } from "@apollo/client";
import FormControl from "@mui/joy/FormControl";
import FormHelperText from "@mui/joy/FormHelperText";
import FormLabel from "@mui/joy/FormLabel";
import Input from "@mui/joy/Input";
import Option from "@mui/joy/Option";
import Select from "@mui/joy/Select";
import { useEffect, useState } from "react";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { gql } from "../../../__generated__";
import {
  missingOpenAiApiKeyState,
  selectedBlockState,
  selectedElementTypeState,
} from "../../../state/store";
import { usePersistStore } from "../../../state/zustand";
import EditorHeader from "./EditorHeader";

const SELECTED_COMPLETER_BLOCK_FRAGMENT = gql(`
  fragment SelectedCompleterBlock on CompleterBlock {
    id
    model
    temperature
    stop
  }
`);

const DELETE_BLOCK_MUTATION = gql(`
  mutation DeleteCompleterBlockMutation(
    $blockId: UUID!
  ) {
    deleteBlock(
      blockId: $blockId
    ) {
      isSuccess
    }
  }
`);

const UPDATE_COMPLETER_BLOCK_MUTATION = gql(`
  mutation UpdateCompleterBlockMutation(
    $id: UUID!
    $model: String!
    $temperature: Float!
    $stop: String!
  ) {
    updateCompleterBlock(
      id: $id
      model: $model
      temperature: $temperature
      stop: $stop
    ) {
      id
    }
  }
`);

export default function CompleterBlockEditor() {
  // --- Global State ---

  const openAiApiKey = usePersistStore((state) => state.openAiApiKey);
  const setOpenAiApiKey = usePersistStore((state) => state.setOpenAiApiKey);

  const [missingOpenAiApiKey, setMissingOpenAiApiKey] = useRecoilState(
    missingOpenAiApiKeyState
  );
  const setSelectedElementType = useSetRecoilState(selectedElementTypeState);
  const selectedBlockId = useRecoilValue(selectedBlockState);

  // --- GraphQL ---

  const client = useApolloClient();

  const result = client.readFragment({
    id: `CompleterBlock:${selectedBlockId}`,
    fragment: SELECTED_COMPLETER_BLOCK_FRAGMENT,
  });

  const [deleteBlock] = useMutation(DELETE_BLOCK_MUTATION, {
    refetchQueries: ["WorkspaceRouteQuery"],
  });
  const [updateCompleterBlock] = useMutation(UPDATE_COMPLETER_BLOCK_MUTATION, {
    refetchQueries: ["WorkspaceRouteQuery"],
  });

  // --- State ---

  const [model, setModel] = useState<string | null>(result?.model ?? null);
  const [temperature, setTemperature] = useState<number>(
    result?.temperature ?? 0.0
  );
  const [stop, setStop] = useState<string>(
    (result?.stop ?? "").replace("\n", "↵")
  );

  useEffect(() => {
    setModel(result?.model ?? null);
    setTemperature(result?.temperature ?? 0.0);
    setStop((result?.stop ?? "").replace("\n", "↵"));
  }, [result]);

  if (result == null) {
    return null;
  }

  return (
    <>
      <EditorHeader
        title="Completer"
        buttonItems={[
          {
            title: "Save",
            onClick: () => {
              updateCompleterBlock({
                variables: {
                  id: result.id,
                  model: model!,
                  temperature,
                  stop: stop.replace("↵", "\n"),
                },
              });
            },
          },
          {
            title: "Delete",
            onClick: () => {
              deleteBlock({ variables: { blockId: result.id } }).then(
                ({ errors, data }) => {
                  if (errors || data?.deleteBlock?.isSuccess !== true) {
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
        <FormLabel>Model</FormLabel>
        <Select
          value={model}
          onChange={(event, newValue: string | null) => {
            if (event == null) {
              return;
            }
            setModel(newValue);
          }}
        >
          <Option value="gpt-3.5-turbo">gpt-3.5-turbo</Option>
          <Option value="gpt-4">gpt-4</Option>
        </Select>
      </FormControl>
      <FormControl className="Editor_input_block">
        <FormLabel>Temperature</FormLabel>
        <Input
          type="number"
          slotProps={{ input: { min: 0, max: 2, step: 0.1 } }}
          value={temperature}
          onChange={(event) => {
            setTemperature(parseFloat(event.target.value));
          }}
        />
      </FormControl>
      <FormControl className="Editor_input_block">
        <FormLabel>Stop sequences</FormLabel>
        <Input
          value={stop}
          onKeyDown={(event) => {
            if (event.shiftKey && event.key === "Enter") {
              event.preventDefault();
              setStop((stop) => stop + "↵");
            }
          }}
          onChange={(event) => {
            setStop(event.target.value);
          }}
        />
        <FormHelperText>
          <span>
            Use <code>SHIFT</code> + <code>ENTER</code> to enter a new line
            character.
          </span>
        </FormHelperText>
      </FormControl>
      <FormControl className="Editor_input_block">
        <FormLabel>Open AI API Key</FormLabel>
        <Input
          value={openAiApiKey ?? ""}
          color={missingOpenAiApiKey ? "danger" : "neutral"}
          onChange={(event) => {
            const value = event.target.value.trim();
            setOpenAiApiKey(value.length ? value : null);
            setMissingOpenAiApiKey(false);
          }}
        />
        {missingOpenAiApiKey && (
          <FormHelperText
            sx={(theme) => ({
              color: theme.palette.danger["400"],
              fontWeight: "bold",
            })}
          >
            Must specify an Open AI API key here.
          </FormHelperText>
        )}
        <FormHelperText
          sx={(theme) => ({
            color: theme.palette.success["400"],
            fontWeight: "bold",
          })}
        >
          This is stored in the your browser, never uploaded.
        </FormHelperText>
      </FormControl>
    </>
  );
}
