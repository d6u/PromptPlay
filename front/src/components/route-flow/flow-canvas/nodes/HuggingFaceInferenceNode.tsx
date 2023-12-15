import FormControl from "@mui/joy/FormControl";
import FormHelperText from "@mui/joy/FormHelperText";
import FormLabel from "@mui/joy/FormLabel";
import Input from "@mui/joy/Input";
import { NodeID, NodeType } from "flow-models/v2-flow-content-types";
import {
  V3HuggingFaceInferenceNodeConfig,
  VariableType,
} from "flow-models/v3-flow-content-types";
import { useContext, useMemo, useState } from "react";
import { Position, useNodeId } from "reactflow";
import { useStore } from "zustand";
import {
  LocalStorageState,
  SpaceState,
  useLocalStorageStore,
  useSpaceStore,
} from "../../../../state/appState";
import FlowContext from "../../FlowContext";
import InputReadonly from "../../common/InputReadonly";
import { useStoreFromFlowStoreContext } from "../../store/FlowStoreContext";
import { selectVariables } from "../../store/state-utils";
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

const persistSelector = (state: LocalStorageState) => ({
  huggingFaceApiToken: state.huggingFaceApiToken,
  setHuggingFaceApiToken: state.setHuggingFaceApiToken,
});

const selector = (state: SpaceState) => ({
  missingHuggingFaceApiToken: state.missingHuggingFaceApiToken,
  setMissingHuggingFaceApiToken: state.setMissingHuggingFaceApiToken,
});

export default function HuggingFaceInferenceNode() {
  const nodeId = useNodeId() as NodeID;

  const { isCurrentUserOwner } = useContext(FlowContext);
  const flowStore = useStoreFromFlowStoreContext();

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

  const { huggingFaceApiToken, setHuggingFaceApiToken } =
    useLocalStorageStore(persistSelector);

  const { missingHuggingFaceApiToken, setMissingHuggingFaceApiToken } =
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
    () => nodeConfigs[nodeId] as V3HuggingFaceInferenceNodeConfig | undefined,
    [nodeConfigs, nodeId],
  );

  const augment = useMemo(
    () => localNodeAugments[nodeId],
    [localNodeAugments, nodeId],
  );

  // It's OK to force unwrap here because nodeConfig will be undefined only
  // when Node is being deleted.
  const [model, setModel] = useState(() => nodeConfig!.model);

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
        nodeType={NodeType.HuggingFaceInference}
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
          title="Hugging Face Inference"
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
            Check Hugging Face's free{" "}
            <a
              href="https://huggingface.co/docs/api-inference/quicktour"
              target="_blank"
              rel="noreferrer"
            >
              Inference API documentation
            </a>{" "}
            for more information about the <code>parameters</code> input.
            Depending on the model you choose, you need to specify different
            parameters.
          </HelperTextContainer>
        </Section>
        {isCurrentUserOwner && (
          <Section>
            <FormControl>
              <FormLabel>API Token</FormLabel>
              <Input
                type="password"
                color={missingHuggingFaceApiToken ? "danger" : "neutral"}
                value={huggingFaceApiToken ?? ""}
                onChange={(e) => {
                  const value = e.target.value.trim();
                  setHuggingFaceApiToken(value.length ? value : null);
                  setMissingHuggingFaceApiToken(false);
                }}
              />
              {missingHuggingFaceApiToken && (
                <HelperTextContainer color="danger">
                  Must provide a Hugging Face API token.
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
            <FormLabel>Model</FormLabel>
            {isCurrentUserOwner ? (
              <Input
                value={model}
                onChange={(e) => {
                  setModel(e.target.value);
                }}
                onKeyUp={(e) => {
                  if (e.key === "Enter") {
                    updateNodeConfig(nodeId, { model });
                  }
                }}
                onBlur={() => {
                  updateNodeConfig(nodeId, { model });
                }}
              />
            ) : (
              <InputReadonly value={model} />
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
