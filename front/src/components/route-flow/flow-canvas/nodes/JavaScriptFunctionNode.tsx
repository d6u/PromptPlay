import FormControl from "@mui/joy/FormControl";
import FormLabel from "@mui/joy/FormLabel";
import Textarea from "@mui/joy/Textarea";
import { useContext, useMemo, useState } from "react";
import { Position, useNodeId, useUpdateNodeInternals } from "reactflow";
import { useStore } from "zustand";
import { NodeID, NodeType } from "../../../../models/v2-flow-content-types";
import {
  V3JavaScriptFunctionNodeConfig,
  VariableType,
} from "../../../../models/v3-flow-content-types";
import { CopyIcon, LabelWithIconContainer } from "../../common/flow-common";
import TextareaReadonly from "../../common/TextareaReadonly";
import FlowContext from "../../FlowContext";
import { useStoreFromFlowStoreContext } from "../../store/FlowStoreContext";
import { selectVariables } from "../../store/state-utils";
import AddVariableButton from "./node-common/AddVariableButton";
import HeaderSection from "./node-common/HeaderSection";
import {
  InputHandle,
  OutputHandle,
  Section,
  SmallSection,
} from "./node-common/node-common";
import NodeBox, { NodeState } from "./node-common/NodeBox";
import NodeInputModifyRow from "./node-common/NodeInputModifyRow";
import NodeOutputRow from "./node-common/NodeOutputRow";
import {
  calculateInputHandleTop,
  calculateOutputHandleBottom,
} from "./node-common/utils";

export default function JavaScriptFunctionNode() {
  const nodeId = useNodeId() as NodeID;

  const { isCurrentUserOwner } = useContext(FlowContext);
  const flowStore = useStoreFromFlowStoreContext();

  // SECTION: Select state from store

  const nodeConfigsDict = useStore(flowStore, (s) => s.nodeConfigsDict);
  const variablesDict = useStore(flowStore, (s) => s.variablesDict);
  const updateNodeConfig = useStore(flowStore, (s) => s.updateNodeConfig);
  const removeNode = useStore(flowStore, (s) => s.removeNode);
  const addVariable = useStore(flowStore, (s) => s.addVariable);
  const updateVariable = useStore(flowStore, (s) => s.updateVariable);
  const removeVariable = useStore(flowStore, (s) => s.removeVariable);
  const nodeMetadataDict = useStore(flowStore, (s) => s.nodeMetadataDict);
  const defaultVariableValueMap = useStore(flowStore, (s) =>
    s.getDefaultVariableValueLookUpDict(),
  );

  // !SECTION

  const inputs = useMemo(() => {
    return selectVariables(nodeId, VariableType.NodeInput, variablesDict);
  }, [nodeId, variablesDict]);

  const outputs = useMemo(() => {
    return selectVariables(nodeId, VariableType.NodeOutput, variablesDict);
  }, [nodeId, variablesDict]);

  const nodeConfig = useMemo(
    () => nodeConfigsDict[nodeId] as V3JavaScriptFunctionNodeConfig | undefined,
    [nodeConfigsDict, nodeId],
  );

  const augment = useMemo(
    () => nodeMetadataDict[nodeId],
    [nodeMetadataDict, nodeId],
  );

  const updateNodeInternals = useUpdateNodeInternals();

  // It's OK to force unwrap here because nodeConfig will be undefined only
  // when Node is being deleted.
  const [javaScriptCode, setJavaScriptCode] = useState(
    () => nodeConfig!.javaScriptCode,
  );

  if (!nodeConfig) {
    return null;
  }

  const functionDefinitionPrefix = `async function (${inputs
    .map((v) => v.name)
    .join(", ")}) {`;

  return (
    <>
      {inputs.map((input, i) => (
        <InputHandle
          key={i}
          type="target"
          id={input.id}
          position={Position.Left}
          style={{
            top: calculateInputHandleTop(i - (isCurrentUserOwner ? 0 : 1)),
          }}
        />
      ))}
      <NodeBox
        nodeType={NodeType.JavaScriptFunctionNode}
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
          title="JavaScript"
          onClickRemove={() => {
            removeNode(nodeId);
          }}
        />
        {isCurrentUserOwner && (
          <SmallSection>
            <AddVariableButton
              onClick={() => {
                addVariable(nodeId, VariableType.NodeInput, inputs.length);
                updateNodeInternals(nodeId);
              }}
            />
          </SmallSection>
        )}
        <Section>
          {inputs.map((input, i) => (
            <NodeInputModifyRow
              key={input.id}
              name={input.name}
              isReadOnly={!isCurrentUserOwner}
              onConfirmNameChange={(name) => {
                updateVariable(input.id, { name });
              }}
              onRemove={() => {
                removeVariable(input.id);
                updateNodeInternals(nodeId);
              }}
            />
          ))}
        </Section>
        <Section>
          <FormControl>
            <LabelWithIconContainer>
              <FormLabel>
                <code>{functionDefinitionPrefix}</code>
              </FormLabel>
              <CopyIcon
                onClick={() => {
                  navigator.clipboard.writeText(`${functionDefinitionPrefix}
  ${javaScriptCode.split("\n").join("\n  ")}
}`);
                }}
              />
            </LabelWithIconContainer>
            {isCurrentUserOwner ? (
              <Textarea
                sx={{ fontFamily: "var(--font-family-mono)" }}
                minRows={6}
                placeholder="Write JavaScript here"
                value={javaScriptCode}
                onChange={(e) => {
                  setJavaScriptCode(e.target.value);
                }}
                onKeyDown={(e) => {
                  if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
                    updateNodeConfig(nodeId, { javaScriptCode });
                  }
                }}
                onBlur={() => {
                  updateNodeConfig(nodeId, { javaScriptCode });
                }}
              />
            ) : (
              <TextareaReadonly value={javaScriptCode} minRows={6} isCode />
            )}
            <code style={{ fontSize: 12 }}>{"}"}</code>
          </FormControl>
        </Section>
        <Section>
          <NodeOutputRow
            id={outputs[0].id}
            name={outputs[0].name}
            value={defaultVariableValueMap[outputs[0].id]}
          />
        </Section>
      </NodeBox>
      <OutputHandle
        type="source"
        id={outputs[0].id}
        position={Position.Right}
        style={{
          bottom: calculateOutputHandleBottom(outputs.length - 1),
        }}
      />
    </>
  );
}
