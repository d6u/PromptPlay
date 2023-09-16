import FormControl from "@mui/joy/FormControl";
import FormLabel from "@mui/joy/FormLabel";
import Textarea from "@mui/joy/Textarea";
import Chance from "chance";
import { nanoid } from "nanoid";
import { adjust, append, assoc, remove } from "ramda";
import { useMemo, useState } from "react";
import { Position, useUpdateNodeInternals, useNodeId } from "reactflow";
import TextareaReadonly from "../flow-common/TextareaReadonly";
import { LabelWithIconContainer } from "../flow-common/flow-common";
import { CopyIcon } from "../flow-common/flow-common";
import {
  InputID,
  JavaScriptFunctionNodeConfig,
  NodeID,
  NodeInputItem,
  NodeType,
} from "../flowTypes";
import { useFlowStore } from "../store/flowStore";
import { FlowState } from "../store/storeTypes";
import AddVariableButton from "./node-common/AddVariableButton";
import HeaderSection from "./node-common/HeaderSection";
import NodeBox, { NodeState } from "./node-common/NodeBox";
import NodeInputModifyRow from "./node-common/NodeInputModifyRow";
import NodeOutputRow from "./node-common/NodeOutputRow";
import {
  InputHandle,
  OutputHandle,
  Section,
  SmallSection,
} from "./node-common/node-common";
import {
  calculateInputHandleTop,
  calculateOutputHandleBottom,
} from "./node-common/utils";

const chance = new Chance();

const selector = (state: FlowState) => ({
  isCurrentUserOwner: state.isCurrentUserOwner,
  nodeConfigs: state.nodeConfigs,
  updateNodeConfig: state.updateNodeConfig,
  removeNode: state.removeNode,
  localNodeAugments: state.localNodeAugments,
});

export default function JavaScriptFunctionNode() {
  const nodeId = useNodeId() as NodeID;

  const {
    isCurrentUserOwner,
    nodeConfigs,
    updateNodeConfig,
    removeNode,
    localNodeAugments,
  } = useFlowStore(selector);

  const nodeConfig = useMemo(
    () => nodeConfigs[nodeId] as JavaScriptFunctionNodeConfig | undefined,
    [nodeConfigs, nodeId]
  );

  const augment = useMemo(
    () => localNodeAugments[nodeId],
    [localNodeAugments, nodeId]
  );

  const updateNodeInternals = useUpdateNodeInternals();

  // It's OK to force unwrap here because nodeConfig will be undefined only
  // when Node is being deleted.
  const [inputs, setInputs] = useState(() => nodeConfig!.inputs);
  const [javaScriptCode, setJavaScriptCode] = useState(
    () => nodeConfig!.javaScriptCode
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
          onClickRemove={() => removeNode(nodeId)}
        />
        {isCurrentUserOwner && (
          <SmallSection>
            <AddVariableButton
              onClick={() => {
                const newInputs = append<NodeInputItem>({
                  id: `${nodeId}/${nanoid()}` as InputID,
                  name: chance.word(),
                })(inputs);

                setInputs(newInputs);

                updateNodeConfig(nodeId, { inputs: newInputs });

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
                const newInputs = adjust<NodeInputItem>(
                  i,
                  assoc("name", name)<NodeInputItem>
                )(inputs);

                setInputs(newInputs);

                updateNodeConfig(nodeId, { inputs: newInputs });
              }}
              onRemove={() => {
                const newInputs = remove(i, 1, inputs);

                setInputs(newInputs);

                updateNodeConfig(nodeId, { inputs: newInputs });

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
            id={nodeConfig.outputs[0].id}
            name={nodeConfig.outputs[0].name}
            value={nodeConfig.outputs[0].value}
          />
        </Section>
      </NodeBox>
      <OutputHandle
        type="source"
        id={nodeConfig.outputs[0].id}
        position={Position.Right}
        style={{
          bottom: calculateOutputHandleBottom(nodeConfig.outputs.length - 1),
        }}
      />
    </>
  );
}
