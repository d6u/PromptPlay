import FormControl from "@mui/joy/FormControl";
import FormHelperText from "@mui/joy/FormHelperText";
import FormLabel from "@mui/joy/FormLabel";
import Input from "@mui/joy/Input";
import Option from "@mui/joy/Option";
import Select from "@mui/joy/Select";
import { useMemo, useState } from "react";
import { Position, useNodeId } from "reactflow";
import { NEW_LINE_SYMBOL } from "../../integrations/openai";
import {
  LocalStorageState,
  SpaceState,
  useLocalStorageStore,
  useSpaceStore,
} from "../../state/appState";
import { FlowState, useFlowStore } from "../flowState";
import {
  ChatGPTChatCompletionNodeConfig,
  NodeID,
  NodeType,
  OpenAIChatModel,
} from "../flowTypes";
import HeaderSection from "./node-common/HeaderSection";
import HelperTextContainer from "./node-common/HelperTextContainer";
import InputDisabled from "./node-common/InputDisabled";
import NodeBox, { NodeState } from "./node-common/NodeBox";
import NodeInputModifyRow from "./node-common/NodeInputModifyRow";
import NodeOutputRow from "./node-common/NodeOutputRow";
import { InputHandle, OutputHandle, Section } from "./node-common/node-common";
import {
  calculateInputHandleTop,
  calculateOutputHandleBottom,
} from "./node-common/utils";

const flowSelector = (state: FlowState) => ({
  isCurrentUserOwner: state.isCurrentUserOwner,
  nodeConfigs: state.nodeConfigs,
  updateNodeConfig: state.updateNodeConfig,
  removeNode: state.removeNode,
  localNodeAugments: state.localNodeAugments,
});

const persistSelector = (state: LocalStorageState) => ({
  openAiApiKey: state.openAiApiKey,
  setOpenAiApiKey: state.setOpenAiApiKey,
});

const selector = (state: SpaceState) => ({
  missingOpenAiApiKey: state.missingOpenAiApiKey,
  setMissingOpenAiApiKey: state.setMissingOpenAiApiKey,
});

export default function ChatGPTChatCompletionNode() {
  const nodeId = useNodeId() as NodeID;

  const {
    isCurrentUserOwner,
    nodeConfigs,
    updateNodeConfig,
    removeNode,
    localNodeAugments,
  } = useFlowStore(flowSelector);
  const { openAiApiKey, setOpenAiApiKey } =
    useLocalStorageStore(persistSelector);
  const { missingOpenAiApiKey, setMissingOpenAiApiKey } =
    useSpaceStore(selector);

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
          isCurrentUserOwner={isCurrentUserOwner}
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
          <HelperTextContainer>
            Check{" "}
            <a
              href="https://platform.openai.com/docs/api-reference/chat/create#messages"
              target="_blank"
              rel="noreferrer"
            >
              OpenAI API reference
            </a>{" "}
            for more information about the <code>messages</code> parameter. The
            generated assistant message will be appended to the list and output
            as the <code>messages</code> output.
          </HelperTextContainer>
        </Section>
        {isCurrentUserOwner && (
          <Section>
            <FormControl size="sm">
              <FormLabel>OpenAI API key</FormLabel>
              <Input
                type="password"
                color={missingOpenAiApiKey ? "danger" : "neutral"}
                value={openAiApiKey ?? ""}
                onChange={(e) => {
                  const value = e.target.value.trim();
                  setOpenAiApiKey(value.length ? value : null);
                  setMissingOpenAiApiKey(false);
                }}
              />
              {missingOpenAiApiKey && (
                <HelperTextContainer color="danger">
                  Must specify an Open AI API key here.
                </HelperTextContainer>
              )}
              <FormHelperText>
                This is stored in your browser's local storage. Never uploaded.
              </FormHelperText>
            </FormControl>
          </Section>
        )}
        <Section>
          <FormControl size="sm">
            <FormLabel>Model</FormLabel>
            <Select
              disabled={!isCurrentUserOwner}
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
          </FormControl>
        </Section>
        <Section>
          <FormControl size="sm">
            <FormLabel>Temperature</FormLabel>
            {isCurrentUserOwner ? (
              <Input
                type="number"
                slotProps={{ input: { min: 0, max: 2, step: 0.1 } }}
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
            ) : (
              <InputDisabled type="number" value={temperature} />
            )}
          </FormControl>
        </Section>
        <Section>
          <FormControl size="sm">
            <FormLabel>Stop sequence</FormLabel>
            {isCurrentUserOwner ? (
              <Input
                placeholder="Stop sequence"
                value={
                  stop.length ? stop[0].replace(/\n/g, NEW_LINE_SYMBOL) : ""
                }
                onKeyDown={(event) => {
                  if (event.shiftKey && event.key === "Enter") {
                    event.preventDefault();
                    setStop((stop) =>
                      stop.length ? [stop[0] + "\n"] : ["\n"]
                    );
                  }
                }}
                onChange={(e) => {
                  const v = e.target.value;

                  if (!v) {
                    setStop([]);
                    return;
                  }

                  setStop([v.replace(RegExp(NEW_LINE_SYMBOL, "g"), "\n")]);
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
            ) : (
              <InputDisabled
                value={
                  stop.length ? stop[0].replace(/\n/g, NEW_LINE_SYMBOL) : ""
                }
              />
            )}
            <FormHelperText>
              <div>
                Use <code>SHIFT</code> + <code>ENTER</code> to enter a new line
                character. (Visually represented by{" "}
                <code>"{NEW_LINE_SYMBOL}"</code>.)
              </div>
            </FormHelperText>
          </FormControl>
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
