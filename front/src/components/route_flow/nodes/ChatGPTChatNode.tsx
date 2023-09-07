import Button from "@mui/joy/Button";
import Input from "@mui/joy/Input";
import Option from "@mui/joy/Option";
import Select from "@mui/joy/Select";
import { useState } from "react";
import { Position, NodeProps } from "reactflow";
import { RFState, useRFStore } from "../../../state/flowState";
import { LLM_STOP_NEW_LINE_SYMBOL } from "../../../static/blockConfigs";
import {
  ChatGPTChatNodeData,
  OpenAIChatModel,
} from "../../../static/flowTypes";
import NodeInputVariableInput from "../common/NodeInputVariableInput";
import {
  Content,
  HeaderSection,
  InputHandle,
  OutputHandle,
  OutputLabel,
  OutputName,
  OutputValue,
  Section,
} from "../common/commonStyledComponents";
import {
  calculateInputHandleTop,
  calculateOutputHandleBottom,
} from "../common/utils";

const selector = (state: RFState) => ({
  onUpdateNode: state.onUpdateNode,
  onRemoveNode: state.onRemoveNode,
});

export default function ChatGPTChatNode(props: NodeProps<ChatGPTChatNodeData>) {
  const { onUpdateNode, onRemoveNode } = useRFStore(selector);

  const [model, setModel] = useState(props.data.model);
  const [temperature, setTemperature] = useState(props.data.temperature);
  const [stop, setStop] = useState(props.data.stop);

  return (
    <>
      <InputHandle
        type="target"
        id={props.data.inputs[0].id}
        position={Position.Left}
        style={{ top: calculateInputHandleTop(0) }}
      />
      <Content>
        <HeaderSection>
          <div />
          <Button
            color="danger"
            size="sm"
            variant="outlined"
            onClick={() => onRemoveNode(props.id)}
          >
            Remove node
          </Button>
        </HeaderSection>
        <Section>
          <NodeInputVariableInput
            key={props.data.inputs[0].id}
            name={props.data.inputs[0].name}
            isReadOnly
          />
        </Section>
        <Section>
          <Select
            size="sm"
            variant="outlined"
            // disabled={props.isReadOnly}
            value={model}
            onChange={(_, value) => {
              setModel(value!);
              // props.onSaveModel(value!);
            }}
          >
            {Object.values(OpenAIChatModel).map((model) => (
              <Option key={model} value={model}>
                {model}
              </Option>
            ))}
          </Select>
        </Section>
        <Section>
          <Input
            color="neutral"
            size="sm"
            variant="outlined"
            type="number"
            slotProps={{ input: { min: 0, max: 2, step: 0.1 } }}
            // disabled={props.isReadOnly}
            value={temperature}
            onChange={(e) => {
              setTemperature(Number(e.target.value));
            }}
            onKeyUp={(e) => {
              if (e.key === "Enter") {
                // props.onSaveTemperaturel(temperature);
              }
            }}
            // onBlur={() => props.onSaveTemperaturel(temperature)}
          />
        </Section>
        <Section>
          <Input
            color="neutral"
            size="sm"
            variant="outlined"
            // disabled={props.isReadOnly}
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
                // onSaveStop();
              }
            }}
            // onBlur={() => onSaveStop()}
          />
        </Section>
        <Section>
          {props.data.outputs.map((output, i) => (
            <OutputLabel key={output.id}>
              <OutputName>{output.name} =&nbsp;</OutputName>
              <OutputValue>{JSON.stringify(output.value)}</OutputValue>
            </OutputLabel>
          ))}
        </Section>
      </Content>
      {props.data.outputs.map((output, i) => (
        <OutputHandle
          key={output.id}
          type="source"
          id={output.id}
          position={Position.Right}
          style={{
            bottom: calculateOutputHandleBottom(
              props.data.outputs.length - 1 - i
            ),
          }}
        />
      ))}
    </>
  );
}
