import FormControl from "@mui/joy/FormControl";
import FormHelperText from "@mui/joy/FormHelperText";
import FormLabel from "@mui/joy/FormLabel";
import IconButton from "@mui/joy/IconButton";
import Textarea from "@mui/joy/Textarea";
import Chance from "chance";
import { adjust, append, assoc, remove } from "ramda";
import { useContext, useEffect, useMemo, useState } from "react";
import { Position, useUpdateNodeInternals, useNodeId } from "reactflow";
import {
  NodeInputID,
  NodeID,
  NodeInputItem,
  NodeType,
} from "../../../../models/flow-content-types";
import {
  VariableType,
  V3TextTemplateNodeConfig,
} from "../../../../models/v3-flow-content-types";
import randomId from "../../../../utils/randomId";
import FlowContext from "../../FlowContext";
import TextareaReadonly from "../../common/TextareaReadonly";
import { CopyIcon, LabelWithIconContainer } from "../../common/flow-common";
import { useFlowStore } from "../../store/store-flow";
import { selectVariables } from "../../store/store-utils";
import { FlowState } from "../../store/types-local-state";
import { DetailPanelContentType } from "../../store/types-local-state";
import AddVariableButton from "./node-common/AddVariableButton";
import HeaderSection from "./node-common/HeaderSection";
import NodeBox from "./node-common/NodeBox";
import NodeInputModifyRow from "./node-common/NodeInputModifyRow";
import NodeOutputRow from "./node-common/NodeOutputRow";
import {
  InputHandle,
  OutputHandle,
  Section,
  SmallSection,
  StyledIconGear,
} from "./node-common/node-common";
import {
  calculateInputHandleTop,
  calculateOutputHandleBottom,
} from "./node-common/utils";

const chance = new Chance();

const selector = (state: FlowState) => ({
  nodeConfigs: state.nodeConfigs,
  variableConfigs: state.variableConfigs,
  updateNodeConfig: state.updateNodeConfig,
  updateInputVariable: state.updateInputVariable,
  removeNode: state.removeNode,
  addInputVariable: state.addInputVariable,
  removeInputVariable: state.removeInputVariable,
  setDetailPanelContentType: state.setDetailPanelContentType,
  setDetailPanelSelectedNodeId: state.setDetailPanelSelectedNodeId,
  defaultVariableValueMap: state.getDefaultVariableValueMap(),
});

export default function TextTemplateNode() {
  const { isCurrentUserOwner } = useContext(FlowContext);

  const nodeId = useNodeId() as NodeID;

  const {
    nodeConfigs,
    variableConfigs,
    updateNodeConfig,
    updateInputVariable,
    removeNode,
    addInputVariable,
    removeInputVariable,
    setDetailPanelContentType,
    setDetailPanelSelectedNodeId,
    defaultVariableValueMap,
  } = useFlowStore(selector);

  const inputVariables = selectVariables(
    nodeId,
    VariableType.NodeInput,
    variableConfigs
  );

  const outputVariables = selectVariables(
    nodeId,
    VariableType.NodeOutput,
    variableConfigs
  );

  const nodeConfig = useMemo(
    () => nodeConfigs[nodeId] as V3TextTemplateNodeConfig | undefined,
    [nodeConfigs, nodeId]
  );

  const updateNodeInternals = useUpdateNodeInternals();

  const [inputs, setInputs] = useState(() => inputVariables);

  // It's OK to force unwrap here because nodeConfig will be undefined only
  // when Node is being deleted.
  const [content, setContent] = useState(() => nodeConfig!.content);

  useEffect(() => {
    setContent(() => nodeConfig!.content ?? "");
  }, [nodeConfig]);

  if (!nodeConfig) {
    return null;
  }

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
      <NodeBox nodeType={NodeType.TextTemplate}>
        <HeaderSection
          isCurrentUserOwner={isCurrentUserOwner}
          title="Text"
          onClickRemove={() => {
            removeNode(nodeId);
          }}
        />
        {isCurrentUserOwner && (
          <SmallSection>
            <AddVariableButton
              onClick={() => {
                const newInputs = append<NodeInputItem>({
                  id: `${nodeId}/${randomId()}` as NodeInputID,
                  name: chance.word(),
                })(inputs);

                setInputs(newInputs);

                addInputVariable(nodeId);

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

                updateInputVariable(nodeId, i, { name });
              }}
              onRemove={() => {
                const newInputs = remove(i, 1, inputs);

                setInputs(newInputs);

                removeInputVariable(nodeId, i);

                updateNodeInternals(nodeId);
              }}
            />
          ))}
        </Section>
        <Section>
          <FormControl>
            <LabelWithIconContainer>
              <FormLabel>Text content</FormLabel>
              <CopyIcon
                onClick={() => {
                  navigator.clipboard.writeText(content);
                }}
              />
            </LabelWithIconContainer>
            {isCurrentUserOwner ? (
              <Textarea
                color="neutral"
                variant="outlined"
                minRows={3}
                maxRows={5}
                placeholder="Write JavaScript here"
                value={content}
                onChange={(e) => {
                  setContent(e.target.value);
                }}
                onKeyDown={(e) => {
                  if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
                    updateNodeConfig(nodeId, { content });
                  }
                }}
                onBlur={() => {
                  updateNodeConfig(nodeId, { content });
                }}
              />
            ) : (
              <TextareaReadonly value={content} minRows={3} maxRows={5} />
            )}
            <FormHelperText>
              <div>
                <a
                  href="https://mustache.github.io/"
                  target="_blank"
                  rel="noreferrer"
                >
                  Mustache template
                </a>{" "}
                is used here. TL;DR: use <code>{"{{variableName}}"}</code> to
                insert a variable.
              </div>
            </FormHelperText>
          </FormControl>
        </Section>
        <Section>
          <IconButton
            variant="outlined"
            onClick={() => {
              setDetailPanelContentType(
                DetailPanelContentType.ChatGPTMessageConfig
              );
              setDetailPanelSelectedNodeId(nodeId);
            }}
          >
            <StyledIconGear />
          </IconButton>
        </Section>
        <Section>
          {outputVariables.map((output, i) => (
            <NodeOutputRow
              key={output.id}
              id={output.id}
              name={output.name}
              value={defaultVariableValueMap[output.id]}
              onClick={() => {
                setDetailPanelContentType(
                  DetailPanelContentType.ChatGPTMessageConfig
                );
                setDetailPanelSelectedNodeId(nodeId);
              }}
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
