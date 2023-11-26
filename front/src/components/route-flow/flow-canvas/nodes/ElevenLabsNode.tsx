import FormControl from "@mui/joy/FormControl";
import FormHelperText from "@mui/joy/FormHelperText";
import FormLabel from "@mui/joy/FormLabel";
import Input from "@mui/joy/Input";
import { useContext, useMemo, useState } from "react";
import { Position, useNodeId } from "reactflow";
import invariant from "ts-invariant";
import { useStore } from "zustand";
import { NodeID, NodeType } from "../../../../models/v2-flow-content-types";
import {
  V3ElevenLabsNodeConfig,
  VariableType,
} from "../../../../models/v3-flow-content-types";
import {
  LocalStorageState,
  SpaceState,
  useLocalStorageStore,
  useSpaceStore,
} from "../../../../state/appState";
import InputReadonly from "../../common/InputReadonly";
import FlowContext from "../../FlowContext";
import { selectVariables } from "../../store/state-utils";
import HeaderSection from "./node-common/HeaderSection";
import HelperTextContainer from "./node-common/HelperTextContainer";
import { InputHandle, OutputHandle, Section } from "./node-common/node-common";
import NodeBox, { NodeState } from "./node-common/NodeBox";
import NodeInputModifyRow from "./node-common/NodeInputModifyRow";
import NodeOutputRow from "./node-common/NodeOutputRow";
import {
  calculateInputHandleTop,
  calculateOutputHandleBottom,
} from "./node-common/utils";

const persistSelector = (state: LocalStorageState) => ({
  elevenLabsApiKey: state.elevenLabsApiKey,
  setElevenLabsApiKey: state.setElevenLabsApiKey,
});

const selector = (state: SpaceState) => ({
  missingElevenLabsApiKey: state.missingElevenLabsApiKey,
  setMissingElevenLabsApiKey: state.setMissingElevenLabsApiKey,
});

export default function ElevenLabsNode() {
  const nodeId = useNodeId() as NodeID;

  const { flowStore, isCurrentUserOwner } = useContext(FlowContext);
  invariant(flowStore != null, "Must provide flowStore");

  // SECTION: Select state from store

  const nodeConfigs = useStore(flowStore, (s) => s.nodeConfigsDict);
  const variableConfigs = useStore(flowStore, (s) => s.variablesDict);
  const updateNodeConfig = useStore(flowStore, (s) => s.updateNodeConfig);
  const removeNode = useStore(flowStore, (s) => s.removeNode);
  const localNodeAugments = useStore(flowStore, (s) => s.nodeMetadataDict);
  const defaultVariableValueMap = useStore(flowStore, (s) =>
    s.getDefaultVariableValueLookUpDict(),
  );

  // !SECTION

  const { elevenLabsApiKey, setElevenLabsApiKey } =
    useLocalStorageStore(persistSelector);

  const { missingElevenLabsApiKey, setMissingElevenLabsApiKey } =
    useSpaceStore(selector);

  const inputVariables = selectVariables(
    nodeId,
    VariableType.NodeInput,
    variableConfigs,
  );

  const outputVariables = selectVariables(
    nodeId,
    VariableType.NodeOutput,
    variableConfigs,
  );

  const nodeConfig = useMemo(
    () => nodeConfigs[nodeId] as V3ElevenLabsNodeConfig | undefined,
    [nodeConfigs, nodeId],
  );

  const augment = useMemo(
    () => localNodeAugments[nodeId],
    [localNodeAugments, nodeId],
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
        id={inputVariables[0].id}
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
            key={inputVariables[0].id}
            name={inputVariables[0].name}
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
          {outputVariables.map((output, i) => (
            <NodeOutputRow
              key={output.id}
              id={output.id}
              name={output.name}
              value={defaultVariableValueMap[output.id]}
            />
          ))}
        </Section>
      </NodeBox>
      {outputVariables.map((output, i) => (
        <OutputHandle
          key={output.id}
          type="source"
          id={output.id}
          position={Position.Right}
          style={{
            bottom: calculateOutputHandleBottom(outputVariables.length - 1 - i),
          }}
        />
      ))}
    </>
  );
}
