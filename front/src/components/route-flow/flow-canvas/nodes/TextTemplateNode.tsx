import FormControl from "@mui/joy/FormControl";
import FormHelperText from "@mui/joy/FormHelperText";
import FormLabel from "@mui/joy/FormLabel";
import IconButton from "@mui/joy/IconButton";
import Textarea from "@mui/joy/Textarea";
import { useContext, useEffect, useMemo, useState } from "react";
import { Position, useNodeId, useUpdateNodeInternals } from "reactflow";
import { NodeID, NodeType } from "../../../../models/flow-content-types";
import {
  V3TextTemplateNodeConfig,
  VariableConfigType,
} from "../../../../models/v3-flow-content-types";
import { CopyIcon, LabelWithIconContainer } from "../../common/flow-common";
import TextareaReadonly from "../../common/TextareaReadonly";
import FlowContext from "../../FlowContext";
import { useFlowStore } from "../../store/store-flow";
import { selectVariables } from "../../store/store-utils";
import {
  DetailPanelContentType,
  FlowState,
} from "../../store/types-local-state";
import AddVariableButton from "./node-common/AddVariableButton";
import HeaderSection from "./node-common/HeaderSection";
import {
  InputHandle,
  OutputHandle,
  Section,
  SmallSection,
  StyledIconGear,
} from "./node-common/node-common";
import NodeBox from "./node-common/NodeBox";
import NodeInputModifyRow from "./node-common/NodeInputModifyRow";
import NodeOutputRow from "./node-common/NodeOutputRow";
import {
  calculateInputHandleTop,
  calculateOutputHandleBottom,
} from "./node-common/utils";

const selector = (state: FlowState) => ({
  nodeConfigs: state.nodeConfigs,
  variableConfigs: state.variableConfigs,
  updateNodeConfig: state.updateNodeConfig,
  removeNode: state.removeNode,
  addVariable: state.addVariable,
  updateVariable: state.updateVariable,
  removeVariable: state.removeVariable,
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
    removeNode,
    addVariable,
    updateVariable,
    removeVariable,
    setDetailPanelContentType,
    setDetailPanelSelectedNodeId,
    defaultVariableValueMap,
  } = useFlowStore(selector);

  const inputs = useMemo(() => {
    return selectVariables(
      nodeId,
      VariableConfigType.NodeInput,
      variableConfigs,
    );
  }, [nodeId, variableConfigs]);

  const outputs = useMemo(() => {
    return selectVariables(
      nodeId,
      VariableConfigType.NodeOutput,
      variableConfigs,
    );
  }, [nodeId, variableConfigs]);

  const nodeConfig = useMemo(() => {
    return nodeConfigs[nodeId] as V3TextTemplateNodeConfig | undefined;
  }, [nodeConfigs, nodeId]);

  const updateNodeInternals = useUpdateNodeInternals();

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
                addVariable(
                  nodeId,
                  VariableConfigType.NodeInput,
                  inputs.length,
                );
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
                DetailPanelContentType.ChatGPTMessageConfig,
              );
              setDetailPanelSelectedNodeId(nodeId);
            }}
          >
            <StyledIconGear />
          </IconButton>
        </Section>
        <Section>
          {outputs.map((output, i) => (
            <NodeOutputRow
              key={output.id}
              id={output.id}
              name={output.name}
              value={defaultVariableValueMap[output.id]}
              onClick={() => {
                setDetailPanelContentType(
                  DetailPanelContentType.ChatGPTMessageConfig,
                );
                setDetailPanelSelectedNodeId(nodeId);
              }}
            />
          ))}
        </Section>
      </NodeBox>
      {outputs.map((output, i) => (
        <OutputHandle
          key={output.id}
          type="source"
          id={output.id}
          position={Position.Right}
          style={{
            bottom: calculateOutputHandleBottom(outputs.length - 1 - i),
          }}
        />
      ))}
    </>
  );
}
