import Button from "@mui/joy/Button";
import Input from "@mui/joy/Input";
import Option from "@mui/joy/Option";
import Select from "@mui/joy/Select";
import { useMemo, useState } from "react";
import { Position, useNodeId } from "reactflow";
import { FlowState, useFlowStore } from "../../../state/flowState";
import { LLM_STOP_NEW_LINE_SYMBOL } from "../../../static/blockConfigs";
import {
  ChatGPTChatCompletionNodeConfig,
  NodeID,
  OpenAIChatModel,
} from "../../../static/flowTypes";
import {
  HeaderSection,
  InputHandle,
  OutputHandle,
  Section,
} from "../common/commonStyledComponents";
import {
  calculateInputHandleTop,
  calculateOutputHandleBottom,
} from "../common/utils";
import NodeBox from "./NodeBox";
import NodeInputModifyRow from "./NodeInputModifyRow";
import NodeOutputRow from "./NodeOutputRow";

const selector = (state: FlowState) => ({
  nodeConfigs: state.nodeConfigs,
  updateNodeConfig: state.updateNodeConfig,
  removeNode: state.removeNode,
});

export default function ChatGPTChatCompletionNode() {
  const nodeId = useNodeId() as NodeID;

  const { nodeConfigs, updateNodeConfig, removeNode } = useFlowStore(selector);

  const nodeConfig = useMemo(
    () => nodeConfigs[nodeId] as ChatGPTChatCompletionNodeConfig,
    [nodeConfigs, nodeId]
  );

  const [model, setModel] = useState(nodeConfig.model);
  const [temperature, setTemperature] = useState(nodeConfig.temperature);
  const [stop, setStop] = useState(nodeConfig.stop);

  return (
    <>
      <InputHandle
        type="target"
        id={nodeConfig.inputs[0].id}
        position={Position.Left}
        style={{ top: calculateInputHandleTop(0) }}
      />
      <NodeBox>
        <HeaderSection>
          <div />
          <Button
            color="danger"
            size="sm"
            variant="outlined"
            onClick={() => removeNode(nodeId)}
          >
            Remove node
          </Button>
        </HeaderSection>
        <Section>
          <NodeInputModifyRow
            key={nodeConfig.inputs[0].id}
            name={nodeConfig.inputs[0].name}
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
              const newModel = value as OpenAIChatModel;
              setModel(newModel);
              updateNodeConfig(nodeId, { model: newModel });
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
                updateNodeConfig(nodeId, { temperature });
              }
            }}
            onBlur={() => {
              updateNodeConfig(nodeId, { temperature });
            }}
          />
        </Section>
        <Section>
          <Input
            color="neutral"
            size="sm"
            variant="outlined"
            // disabled={props.isReadOnly}
            placeholder="Stop sequence"
            value={
              stop.length
                ? stop[0].replace(/\n/g, LLM_STOP_NEW_LINE_SYMBOL)
                : ""
            }
            onKeyDown={(event) => {
              if (event.shiftKey && event.key === "Enter") {
                event.preventDefault();
                setStop((stop) => (stop.length ? [stop[0] + "\n"] : ["\n"]));
              }
            }}
            onChange={(e) => {
              setStop([
                e.target.value.replace(
                  RegExp(LLM_STOP_NEW_LINE_SYMBOL, "g"),
                  "\n"
                ),
              ]);
            }}
            onKeyUp={(e) => {
              if (e.key === "Enter") {
                updateNodeConfig(nodeId, { stop });
              }
            }}
            onBlur={() => {
              updateNodeConfig(nodeId, { stop });
            }}
          />
        </Section>
        <Section>
          {nodeConfig.outputs.map((output, i) => (
            <NodeOutputRow
              key={output.id}
              id={output.id}
              name={output.name}
              value={output.value}
            />
          ))}
        </Section>
      </NodeBox>
      {nodeConfig.outputs.map((output, i) => (
        <OutputHandle
          key={output.id}
          type="source"
          id={output.id}
          position={Position.Right}
          style={{
            bottom: calculateOutputHandleBottom(
              nodeConfig.outputs.length - 1 - i
            ),
          }}
        />
      ))}
    </>
  );
}
