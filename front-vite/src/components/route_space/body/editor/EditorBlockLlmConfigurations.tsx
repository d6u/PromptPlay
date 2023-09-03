import Input from "@mui/joy/Input";
import Option from "@mui/joy/Option";
import Select from "@mui/joy/Select";
import { useCallback, useState } from "react";
import { useRecoilState } from "recoil";
import { missingOpenAiApiKeyState } from "../../../../state/store";
import { usePersistStore } from "../../../../state/zustand";
import { LLM_STOP_NEW_LINE_SYMBOL } from "../../../../static/blockConfigs";
import {
  BlockLlm,
  LlmModel,
  SpaceContent,
} from "../../../../static/spaceTypes";
import EditorBlockInputOutput from "./shared/EditorBlockInputOutput";
import {
  FieldHelperText,
  FieldRow,
  FieldTitle,
} from "./shared/editorCommonComponents";

type Props = {
  isReadOnly: boolean;
  model: LlmModel;
  onSaveModel: (model: LlmModel) => void;
  temperature: number;
  onSaveTemperaturel: (temperature: number) => void;
  stop: Array<string>;
  onSaveStop: (stop: Array<string>) => void;
  variableNameForMessage: string;
  onSaveVariableNameForMessage: (variableNameForMessage: string) => void;
  variableNameForContent: string;
  onSaveVariableNameForContent: (variableNameForContent: string) => void;
  selectedBlock: BlockLlm;
  spaceId: string;
  spaceContent: SpaceContent;
};

export default function EditorBlockLlmConfigurations(props: Props) {
  const openAiApiKey = usePersistStore((state) => state.openAiApiKey);
  const setOpenAiApiKey = usePersistStore((state) => state.setOpenAiApiKey);

  const [missingOpenAiApiKey, setMissingOpenAiApiKey] = useRecoilState(
    missingOpenAiApiKeyState
  );

  const [model, setModel] = useState(props.model);
  const [temperature, setTemperature] = useState(props.temperature);
  const [stop, setStop] = useState(props.stop);
  const [variableNameForMessage, setVariableNameForMessage] = useState(
    props.variableNameForMessage
  );
  const [variableNameForContent, setVariableNameForContent] = useState(
    props.variableNameForContent
  );

  const onSaveStop = useCallback(() => {
    if (stop.length === 0) {
      props.onSaveStop([]);
    } else if (stop[0] === "") {
      props.onSaveStop([]);
    } else {
      props.onSaveStop(stop);
    }
  }, [stop, props]);

  return (
    <>
      <EditorBlockInputOutput
        isReadOnly={props.isReadOnly}
        block={props.selectedBlock}
        isInput={true}
        singleVariable={props.selectedBlock.singleInput}
        spaceId={props.spaceId}
        spaceContent={props.spaceContent}
      />
      <FieldRow>
        <FieldTitle>OpenAI API Key</FieldTitle>
        <Input
          color={missingOpenAiApiKey ? "danger" : "neutral"}
          size="sm"
          variant="outlined"
          disabled={props.isReadOnly}
          value={openAiApiKey ?? ""}
          onChange={(e) => {
            const value = e.target.value.trim();
            setOpenAiApiKey(value.length ? value : null);
            setMissingOpenAiApiKey(false);
          }}
        />
        {missingOpenAiApiKey && (
          <FieldHelperText $type="error">
            Must specify an Open AI API key here.
          </FieldHelperText>
        )}
        <FieldHelperText $type="success">
          This is stored locally in your browser, never uploaded.
        </FieldHelperText>
      </FieldRow>
      <FieldRow>
        <FieldTitle>Model</FieldTitle>
        <Select
          size="sm"
          variant="outlined"
          disabled={props.isReadOnly}
          value={model}
          onChange={(_, value) => {
            setModel(value!);
            props.onSaveModel(value!);
          }}
        >
          <Option value={LlmModel.GPT3_5_TURBO}>{LlmModel.GPT3_5_TURBO}</Option>
          <Option value={LlmModel.GPT4}>{LlmModel.GPT4}</Option>
        </Select>
      </FieldRow>
      <FieldRow>
        <FieldTitle>Temperature</FieldTitle>
        <Input
          color="neutral"
          size="sm"
          variant="outlined"
          type="number"
          slotProps={{ input: { min: 0, max: 2, step: 0.1 } }}
          disabled={props.isReadOnly}
          value={temperature}
          onChange={(e) => {
            setTemperature(Number(e.target.value));
          }}
          onKeyUp={(e) => {
            if (e.key === "Enter") {
              props.onSaveTemperaturel(temperature);
            }
          }}
          onBlur={() => props.onSaveTemperaturel(temperature)}
        />
      </FieldRow>
      <FieldRow>
        <FieldTitle>Stop</FieldTitle>
        <Input
          color="neutral"
          size="sm"
          variant="outlined"
          disabled={props.isReadOnly}
          value={
            stop.length ? stop[0].replace("\n", LLM_STOP_NEW_LINE_SYMBOL) : ""
          }
          onKeyDown={(event) => {
            if (event.shiftKey && event.key === "Enter") {
              event.preventDefault();
              setStop((stop) => (stop.length ? [stop[0] + "\n"] : ["\n"]));
            }
          }}
          onChange={(e) => {
            setStop([e.target.value]);
          }}
          onKeyUp={(e) => {
            if (e.key === "Enter") {
              onSaveStop();
            }
          }}
          onBlur={() => onSaveStop()}
        />
        <FieldHelperText>
          Use <code>SHIFT</code> + <code>ENTER</code> to enter a new line
          character. (Visually represented by{" "}
          <code>"{LLM_STOP_NEW_LINE_SYMBOL}"</code>.)
        </FieldHelperText>
      </FieldRow>
      <FieldRow>
        <FieldTitle>Assign assistant message to variable</FieldTitle>
        <Input
          color="neutral"
          size="sm"
          variant="outlined"
          placeholder="Variable name for message"
          disabled={props.isReadOnly}
          value={variableNameForMessage}
          onChange={(e) => setVariableNameForMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              props.onSaveVariableNameForMessage(variableNameForMessage);
            }
          }}
          onBlur={() =>
            props.onSaveVariableNameForMessage(variableNameForMessage)
          }
        />
      </FieldRow>
      <FieldRow>
        <FieldTitle>Assign message content to variable</FieldTitle>
        <Input
          color="neutral"
          size="sm"
          variant="outlined"
          placeholder="Variable name for content"
          disabled={props.isReadOnly}
          value={variableNameForContent}
          onChange={(e) => setVariableNameForContent(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              props.onSaveVariableNameForContent(variableNameForContent);
            }
          }}
          onBlur={() =>
            props.onSaveVariableNameForContent(variableNameForContent)
          }
        />
      </FieldRow>
    </>
  );
}
