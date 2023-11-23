import FormControl from "@mui/joy/FormControl";
import FormHelperText from "@mui/joy/FormHelperText";
import FormLabel from "@mui/joy/FormLabel";
import Input from "@mui/joy/Input";
import { useContext, useMemo, useState } from "react";
import { Position, useNodeId } from "reactflow";
import {
  ElevenLabsNodeConfig,
  NodeID,
  NodeType,
} from "../../../../models/flow-content-types";
import {
  LocalStorageState,
  SpaceState,
  useLocalStorageStore,
  useSpaceStore,
} from "../../../../state/appState";
import FlowContext from "../../FlowContext";
import InputReadonly from "../../common/InputReadonly";
import { useFlowStore } from "../../store/store-flow";
import { FlowState } from "../../store/types-local-state";
import HeaderSection from "./node-common/HeaderSection";
import HelperTextContainer from "./node-common/HelperTextContainer";
import NodeBox, { NodeState } from "./node-common/NodeBox";
import NodeInputModifyRow from "./node-common/NodeInputModifyRow";
import NodeOutputRow from "./node-common/NodeOutputRow";
import { InputHandle, OutputHandle, Section } from "./node-common/node-common";
import {
  calculateInputHandleTop,
  calculateOutputHandleBottom,
} from "./node-common/utils";

const flowSelector = (state: FlowState) => ({
  nodeConfigs: state.nodeConfigs,
  updateNodeConfig: state.updateNodeConfig,
  removeNode: state.removeNode,
  localNodeAugments: state.localNodeAugments,
  defaultVariableValueMap: state.getDefaultVariableValueMap(),
});

const persistSelector = (state: LocalStorageState) => ({
  elevenLabsApiKey: state.elevenLabsApiKey,
  setElevenLabsApiKey: state.setElevenLabsApiKey,
});

const selector = (state: SpaceState) => ({
  missingElevenLabsApiKey: state.missingElevenLabsApiKey,
  setMissingElevenLabsApiKey: state.setMissingElevenLabsApiKey,
});

export default function ElevenLabsNode() {
  const { isCurrentUserOwner } = useContext(FlowContext);

  const nodeId = useNodeId() as NodeID;

  const {
    nodeConfigs,
    updateNodeConfig,
    removeNode,
    localNodeAugments,
    defaultVariableValueMap,
  } = useFlowStore(flowSelector);
  const { elevenLabsApiKey, setElevenLabsApiKey } =
    useLocalStorageStore(persistSelector);
  const { missingElevenLabsApiKey, setMissingElevenLabsApiKey } =
    useSpaceStore(selector);

  const nodeConfig = useMemo(
    () => nodeConfigs[nodeId] as ElevenLabsNodeConfig | undefined,
    [nodeConfigs, nodeId]
  );

  const augment = useMemo(
    () => localNodeAugments[nodeId],
    [localNodeAugments, nodeId]
  );

  // It's OK to force unwrap here because nodeConfig will be undefined only
  // when Node is being deleted.
  const [voiceId, setVoiceId] = useState(() => nodeConfig!.voiceId);

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
        nodeType={NodeType.ElevenLabs}
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
          title="Eleven Labs Text to Speech"
          onClickRemove={() => {
            removeNode(nodeId);
          }}
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
            Check Elevent Labs's{" "}
            <a
              href="https://docs.elevenlabs.io/api-reference/text-to-speech"
              target="_blank"
              rel="noreferrer"
            >
              Text to Speech API Reference
            </a>{" "}
            for more information.
          </HelperTextContainer>
        </Section>
        {isCurrentUserOwner && (
          <Section>
            <FormControl>
              <FormLabel>API Key</FormLabel>
              <Input
                type="password"
                color={missingElevenLabsApiKey ? "danger" : "neutral"}
                value={elevenLabsApiKey ?? ""}
                onChange={(e) => {
                  const value = e.target.value.trim();
                  setElevenLabsApiKey(value.length ? value : null);
                  setMissingElevenLabsApiKey(false);
                }}
              />
              {missingElevenLabsApiKey && (
                <HelperTextContainer color="danger">
                  Must provide a Eleven Labs API key.
                </HelperTextContainer>
              )}
              <FormHelperText>
                This is stored in your browser's local storage. Never uploaded.
              </FormHelperText>
            </FormControl>
          </Section>
        )}
        <Section>
          <FormControl>
            <FormLabel>Voice ID</FormLabel>
            {isCurrentUserOwner ? (
              <Input
                value={voiceId}
                onChange={(e) => {
                  setVoiceId(e.target.value);
                }}
                onKeyUp={(e) => {
                  if (e.key === "Enter") {
                    updateNodeConfig(nodeId, { voiceId });
                  }
                }}
                onBlur={() => {
                  updateNodeConfig(nodeId, { voiceId });
                }}
              />
            ) : (
              <InputReadonly value={voiceId} />
            )}
          </FormControl>
        </Section>
        <Section>
          {nodeConfig.outputs.map((output, i) => (
            <NodeOutputRow
              key={output.id}
              id={output.id}
              name={output.name}
              value={defaultVariableValueMap[output.id]}
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
