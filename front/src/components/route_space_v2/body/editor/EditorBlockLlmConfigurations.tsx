import {
  missingOpenAiApiKeyState,
  openAiApiKeyState,
} from "../../../../state/store";
import { Block, LlmModel, SpaceContent } from "../../../../static/spaceTypes";
import {
  FieldHelperText,
  FieldRow,
  FieldTitle,
} from "./editorCommonComponents";
import Input from "@mui/joy/Input";
import Option from "@mui/joy/Option";
import Select from "@mui/joy/Select";
import { useCallback, useState } from "react";
import { useRecoilState } from "recoil";

type Props = {
  model: LlmModel;
  onSaveModel: (model: LlmModel) => void;
  temperature: number;
  onSaveTemperaturel: (temperature: number) => void;
  stop: Array<string>;
  onSaveStop: (stop: Array<string>) => void;
  selectedBlock: Block;
  spaceId: string;
  spaceContent: SpaceContent;
};

export default function EditorBlockLlmConfigurations(props: Props) {
  const [openAiApiKey, setOpenAiApiKey] = useRecoilState(openAiApiKeyState);
  const [missingOpenAiApiKey, setMissingOpenAiApiKey] = useRecoilState(
    missingOpenAiApiKeyState
  );

  const [model, setModel] = useState(props.model);
  const [temperature, setTemperature] = useState(props.temperature);
  const [stop, setStop] = useState(props.stop);

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
      <FieldRow>
        <FieldTitle>OpenAI API Key</FieldTitle>
        <Input
          color={missingOpenAiApiKey ? "danger" : "neutral"}
          size="sm"
          variant="outlined"
          value={openAiApiKey}
          onChange={(e) => {
            setOpenAiApiKey(e.target.value);
            setMissingOpenAiApiKey(false);
          }}
        />
        {missingOpenAiApiKey && (
          <FieldHelperText $error>
            Must specify an Open AI API key here.
          </FieldHelperText>
        )}
        <FieldHelperText>
          This is stored in the your browser, never uploaded.
        </FieldHelperText>
      </FieldRow>
      <FieldRow>
        <FieldTitle>Model</FieldTitle>
        <Select
          size="sm"
          variant="outlined"
          value={model}
          onChange={(e, value) => {
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
          value={stop.length ? stop[0] : ""}
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
      </FieldRow>
    </>
  );
}
