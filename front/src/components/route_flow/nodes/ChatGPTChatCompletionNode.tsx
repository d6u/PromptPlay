import Input from "@mui/joy/Input";
import Option from "@mui/joy/Option";
import Select from "@mui/joy/Select";
import { useMemo, useState } from "react";
import { Position, useNodeId } from "reactflow";
import {
  PersistState,
  State,
  usePersistStore,
  useStore,
} from "../../../state/zustand";
import { LLM_STOP_NEW_LINE_SYMBOL } from "../../../static/blockConfigs";
import { FlowState, useFlowStore } from "../flowState";
import {
  ChatGPTChatCompletionNodeConfig,
  NodeID,
  NodeType,
  OpenAIChatModel,
} from "../flowTypes";
import HeaderSection from "./shared/HeaderSection";
import NodeBox, { NodeState } from "./shared/NodeBox";
import NodeInputModifyRow from "./shared/NodeInputModifyRow";
import NodeOutputRow from "./shared/NodeOutputRow";
import {
  InputHandle,
  OutputHandle,
  Section,
} from "./shared/commonStyledComponents";
import {
  calculateInputHandleTop,
  calculateOutputHandleBottom,
} from "./shared/utils";

const flowSelector = (state: FlowState) => ({
  nodeConfigs: state.nodeConfigs,
  updateNodeConfig: state.updateNodeConfig,
  removeNode: state.removeNode,
  localNodeAugments: state.localNodeAugments,
});

const persistSelector = (state: PersistState) => ({
  openAiApiKey: state.openAiApiKey,
  setOpenAiApiKey: state.setOpenAiApiKey,
});

const selector = (state: State) => ({
  missingOpenAiApiKey: state.missingOpenAiApiKey,
  setMissingOpenAiApiKey: state.setMissingOpenAiApiKey,
});

export default function ChatGPTChatCompletionNode() {
  const nodeId = useNodeId() as NodeID;

  const { openAiApiKey, setOpenAiApiKey } = usePersistStore(persistSelector);
  const { missingOpenAiApiKey, setMissingOpenAiApiKey } = useStore(selector);
  const { nodeConfigs, updateNodeConfig, removeNode, localNodeAugments } =
    useFlowStore(flowSelector);

  const nodeConfig = useMemo(
    () => nodeConfigs[nodeId] as ChatGPTChatCompletionNodeConfig | undefined,
    [nodeConfigs, nodeId]
  );

  const augment = useMemo(
    () => localNodeAugments[nodeId],
    [localNodeAugments, nodeId]
  );

  // It's OK to force unwrap here because nodeConfig will be undefined only
  // when Node is being deleted.
  const [model, setModel] = useState(() => nodeConfig!.model);
  const [temperature, setTemperature] = useState<number | "">(
    () => nodeConfig?.temperature ?? ""
  );
  const [stop, setStop] = useState(() => nodeConfig!.stop);

  if (!nodeConfig) {
    return null;
  }

  return (
    <>
      <InputHandle
        type="target"
        id={nodeConfig.inputs[0].id}
        position={Position.Left}
        style={{ top: calculateInputHandleTop(-1) }}
      />
      <NodeBox
        nodeType={NodeType.ChatGPTChatCompletionNode}
        state={
          augment?.isRunning
            ? NodeState.Running
            : augment?.hasError
            ? NodeState.Error
            : NodeState.Idle
        }
      >
        <HeaderSection
          title="ChatGPT Chat Completion"
          onClickRemove={() => removeNode(nodeId)}
        />
        <Section>
          <NodeInputModifyRow
            key={nodeConfig.inputs[0].id}
            name={nodeConfig.inputs[0].name}
            isReadOnly
          />
        </Section>
        <Section>
          <Input
            color={missingOpenAiApiKey ? "danger" : "neutral"}
            size="sm"
            variant="outlined"
            // disabled={props.isReadOnly}
            value={openAiApiKey ?? ""}
            onChange={(e) => {
              const value = e.target.value.trim();
              setOpenAiApiKey(value.length ? value : null);
              setMissingOpenAiApiKey(false);
            }}
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
              if (e.target.value) {
                setTemperature(Number(e.target.value));
              } else {
                // Set to empty string so that on mobile devices, users can
                // type 0 when typing decimal number.
                setTemperature("");
              }
            }}
            onKeyUp={(e) => {
              if (e.key === "Enter") {
                updateNodeConfig(nodeId, { temperature: temperature || 1 });
              }
            }}
            onBlur={() => {
              updateNodeConfig(nodeId, { temperature: temperature || 1 });
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
