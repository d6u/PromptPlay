import FormControl from "@mui/joy/FormControl";
import FormHelperText from "@mui/joy/FormHelperText";
import FormLabel from "@mui/joy/FormLabel";
import IconButton from "@mui/joy/IconButton";
import Radio from "@mui/joy/Radio";
import RadioGroup from "@mui/joy/RadioGroup";
import Textarea from "@mui/joy/Textarea";
import Chance from "chance";
import { adjust, append, assoc, remove } from "ramda";
import { useContext, useEffect, useMemo, useState } from "react";
import { Position, useUpdateNodeInternals, useNodeId } from "reactflow";
import { ChatGPTMessageRole } from "../../integrations/openai";
import randomId from "../../util/randomId";
import FlowContext from "../FlowContext";
import TextareaReadonly from "../flow-common/TextareaReadonly";
import { CopyIcon, LabelWithIconContainer } from "../flow-common/flow-common";
import { useFlowStore } from "../store/store-flow";
import {
  ChatGPTMessageNodeConfig,
  InputID,
  NodeID,
  NodeInputItem,
  NodeType,
} from "../store/types-flow-content";
import { FlowState } from "../store/types-local-state";
import { DetailPanelContentType } from "../store/types-local-state";
import AddVariableButton from "./node-common/AddVariableButton";
import HeaderSection from "./node-common/HeaderSection";
import HelperTextContainer from "./node-common/HelperTextContainer";
import NodeBox from "./node-common/NodeBox";
import NodeInputModifyRow, {
  ROW_MARGIN_TOP,
} from "./node-common/NodeInputModifyRow";
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

const MESSAGES_HELPER_SECTION_HEIGHT = 81;

const chance = new Chance();

const selector = (state: FlowState) => ({
  nodeConfigs: state.nodeConfigs,
  updateNodeConfig: state.updateNodeConfig,
  updateInputVariable: state.updateInputVariable,
  removeNode: state.removeNode,
  addInputVariable: state.addInputVariable,
  removeInputVariable: state.removeInputVariable,
  setDetailPanelContentType: state.setDetailPanelContentType,
  setDetailPanelSelectedNodeId: state.setDetailPanelSelectedNodeId,
  defaultVariableValueMap: state.getDefaultVariableValueMap(),
});

export default function ChatGPTMessageNode() {
  const { isCurrentUserOwner } = useContext(FlowContext);

  const nodeId = useNodeId() as NodeID;

  const {
    nodeConfigs,
    updateNodeConfig,
    updateInputVariable,
    removeNode,
    addInputVariable,
    removeInputVariable,
    setDetailPanelContentType,
    setDetailPanelSelectedNodeId,
    defaultVariableValueMap,
  } = useFlowStore(selector);

  const nodeConfig = useMemo(
    () => nodeConfigs[nodeId] as ChatGPTMessageNodeConfig | undefined,
    [nodeConfigs, nodeId]
  );

  const updateNodeInternals = useUpdateNodeInternals();

  // It's OK to force unwrap here because nodeConfig will be undefined only
  // when Node is being deleted.
  const [inputs, setInputs] = useState(() => nodeConfig!.inputs);
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
                const newInputs = append<NodeInputItem>({
                  id: `${nodeId}/${randomId()}` as InputID,
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
                DetailPanelContentType.ChatGPTMessageConfig
              );
              setDetailPanelSelectedNodeId(nodeId);
            }}
          >
            <StyledIconGear />
          </IconButton>
        </Section>
        <Section>
          {nodeConfig.outputs.map((output, i) => (
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
