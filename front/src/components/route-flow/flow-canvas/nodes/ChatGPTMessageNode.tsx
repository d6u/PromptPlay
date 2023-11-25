import FormControl from "@mui/joy/FormControl";
import FormHelperText from "@mui/joy/FormHelperText";
import FormLabel from "@mui/joy/FormLabel";
import IconButton from "@mui/joy/IconButton";
import Radio from "@mui/joy/Radio";
import RadioGroup from "@mui/joy/RadioGroup";
import Textarea from "@mui/joy/Textarea";
import { useContext, useEffect, useMemo, useState } from "react";
import { Position, useNodeId, useUpdateNodeInternals } from "reactflow";
import { ChatGPTMessageRole } from "../../../../integrations/openai";
import { NodeID, NodeType } from "../../../../models/v2-flow-content-types";
import {
  V3ChatGPTMessageNodeConfig,
  VariableConfigType,
} from "../../../../models/v3-flow-content-types";
import { CopyIcon, LabelWithIconContainer } from "../../common/flow-common";
import TextareaReadonly from "../../common/TextareaReadonly";
import FlowContext from "../../FlowContext";
import { selectVariables } from "../../state/state-utils";
import { useFlowStore } from "../../state/store-flow-state";
import {
  DetailPanelContentType,
  FlowState,
} from "../../state/store-flow-state-types";
import AddVariableButton from "./node-common/AddVariableButton";
import HeaderSection from "./node-common/HeaderSection";
import HelperTextContainer from "./node-common/HelperTextContainer";
import {
  InputHandle,
  OutputHandle,
  Section,
  SmallSection,
  StyledIconGear,
} from "./node-common/node-common";
import NodeBox from "./node-common/NodeBox";
import NodeInputModifyRow, {
  ROW_MARGIN_TOP,
} from "./node-common/NodeInputModifyRow";
import NodeOutputRow from "./node-common/NodeOutputRow";
import {
  calculateInputHandleTop,
  calculateOutputHandleBottom,
} from "./node-common/utils";

const MESSAGES_HELPER_SECTION_HEIGHT = 81;

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

export default function ChatGPTMessageNode() {
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

  const outputVariables = selectVariables(
    nodeId,
    VariableConfigType.NodeOutput,
    variableConfigs,
  );

  const nodeConfig = useMemo(
    () => nodeConfigs[nodeId] as V3ChatGPTMessageNodeConfig | undefined,
    [nodeConfigs, nodeId],
  );

  const updateNodeInternals = useUpdateNodeInternals();

  // SECTION: Input Variables

  const inputs = useMemo(() => {
    return selectVariables(
      nodeId,
      VariableConfigType.NodeInput,
      variableConfigs,
    );
  }, [nodeId, variableConfigs]);

  // !SECTION

  // It's OK to force unwrap here because nodeConfig will be undefined only
  // when Node is being deleted.
  const [content, setContent] = useState(() => nodeConfig!.content);
  const [role, setRole] = useState(() => nodeConfig!.role);

  useEffect(() => {
    setRole(nodeConfig?.role ?? ChatGPTMessageRole.user);
  }, [nodeConfig]);

  useEffect(() => {
    setContent(() => nodeConfig!.content ?? "");
  }, [nodeConfig]);

  if (!nodeConfig) {
    return null;
  }

  return (
    <>
      <InputHandle
        key={0}
        type="target"
        id={inputs[0].id}
        position={Position.Left}
        style={{ top: calculateInputHandleTop(0) }}
      />
      {inputs.map((input, i) => {
        if (i === 0) return null;

        return (
          <InputHandle
            key={i}
            type="target"
            id={input.id}
            position={Position.Left}
            style={{
              top:
                calculateInputHandleTop(i - (isCurrentUserOwner ? 0 : 1)) +
                MESSAGES_HELPER_SECTION_HEIGHT +
                ROW_MARGIN_TOP,
            }}
          />
        );
      })}
      <NodeBox nodeType={NodeType.ChatGPTMessageNode}>
        <HeaderSection
          isCurrentUserOwner={isCurrentUserOwner}
          title="ChatGPT Message"
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
          <NodeInputModifyRow
            key={inputs[0].id}
            name={inputs[0].name}
            isReadOnly
          />
        </Section>
        <Section style={{ height: MESSAGES_HELPER_SECTION_HEIGHT }}>
          <HelperTextContainer>
            <code>messages</code> is a list of ChatGPT message. It's default to
            an empty list if unspecified. The current message will be appended
            to the list and output as the <code>messages</code> output.
          </HelperTextContainer>
        </Section>
        <Section>
          {inputs.map((input, i) => {
            if (i === 0) return null;

            return (
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
            );
          })}
        </Section>
        <Section>
          <FormControl>
            <FormLabel>Role</FormLabel>
            <RadioGroup
              orientation="horizontal"
              value={role}
              onChange={(e) => {
                const role = e.target.value as ChatGPTMessageRole;

                setRole(role);

                updateNodeConfig(nodeId, { role });
              }}
            >
              <Radio
                color="primary"
                name="role"
                label="system"
                disabled={!isCurrentUserOwner}
                value={ChatGPTMessageRole.system}
              />
              <Radio
                color="primary"
                name="role"
                label="user"
                disabled={!isCurrentUserOwner}
                value={ChatGPTMessageRole.user}
              />
              <Radio
                color="primary"
                name="role"
                label="assistant"
                disabled={!isCurrentUserOwner}
                value={ChatGPTMessageRole.assistant}
              />
            </RadioGroup>
          </FormControl>
        </Section>
        <Section>
          <FormControl>
            <LabelWithIconContainer>
              <FormLabel>Message content</FormLabel>
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
          {outputVariables.map((output, i) => (
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
