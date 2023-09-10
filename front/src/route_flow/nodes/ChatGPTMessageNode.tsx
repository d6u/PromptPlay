import FormControl from "@mui/joy/FormControl";
import FormHelperText from "@mui/joy/FormHelperText";
import FormLabel from "@mui/joy/FormLabel";
import Radio from "@mui/joy/Radio";
import RadioGroup from "@mui/joy/RadioGroup";
import Textarea from "@mui/joy/Textarea";
import Chance from "chance";
import { nanoid } from "nanoid";
import { adjust, append, assoc, remove } from "ramda";
import { useMemo, useState } from "react";
import { Position, useUpdateNodeInternals, useNodeId } from "reactflow";
import { ChatGPTMessageRole } from "../../integrations/openai";
import { FlowState, useFlowStore } from "../flowState";
import {
  ChatGPTMessageNodeConfig,
  NodeID,
  NodeInputItem,
  NodeType,
} from "../flowTypes";
import AddVariableButton from "./shared/AddVariableButton";
import CodeHelperText from "./shared/CodeHelperText";
import HeaderSection from "./shared/HeaderSection";
import HelperTextContainer from "./shared/HelperTextContainer";
import NodeBox from "./shared/NodeBox";
import NodeInputModifyRow, {
  ROW_MARGIN_TOP,
} from "./shared/NodeInputModifyRow";
import NodeOutputRow from "./shared/NodeOutputRow";
import {
  InputHandle,
  OutputHandle,
  Section,
  SmallSection,
} from "./shared/commonStyledComponents";
import {
  calculateInputHandleTop,
  calculateOutputHandleBottom,
} from "./shared/utils";

const MESSAGES_HELPER_SECTION_HEIGHT = 81;

const chance = new Chance();

const selector = (state: FlowState) => ({
  nodeConfigs: state.nodeConfigs,
  updateNodeConfig: state.updateNodeConfig,
  removeNode: state.removeNode,
});

export default function ChatGPTMessageNode() {
  const nodeId = useNodeId() as NodeID;

  const { nodeConfigs, updateNodeConfig, removeNode } = useFlowStore(selector);

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
                calculateInputHandleTop(i) +
                MESSAGES_HELPER_SECTION_HEIGHT +
                ROW_MARGIN_TOP,
            }}
          />
        );
      })}
      <NodeBox nodeType={NodeType.ChatGPTMessageNode}>
        <HeaderSection
          title="ChatGPT Message"
          onClickRemove={() => removeNode(nodeId)}
        />
        <SmallSection>
          <AddVariableButton
            onClick={() => {
              const newInputs = append<NodeInputItem>({
                id: `${nodeId}/${nanoid()}`,
                name: chance.word(),
              })(inputs);

              setInputs(newInputs);

              updateNodeConfig(nodeId, { inputs: newInputs });

              updateNodeInternals(nodeId);
            }}
          />
        </SmallSection>
        <Section>
          <NodeInputModifyRow
            key={inputs[0].id}
            name={inputs[0].name}
            isReadOnly
          />
        </Section>
        <Section style={{ height: MESSAGES_HELPER_SECTION_HEIGHT }}>
          <HelperTextContainer>
            <CodeHelperText>messages</CodeHelperText> is a list of ChatGPT
            message. It's default to an empty list if unspecified. The current
            message will be appended to the list and output as the{" "}
            <CodeHelperText>messages</CodeHelperText> output.
          </HelperTextContainer>
        </Section>
        <Section>
          {inputs.map((input, i) => {
            if (i === 0) return null;

            return (
              <NodeInputModifyRow
                key={input.id}
                name={input.name}
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
            );
          })}
        </Section>
        <Section>
          <FormControl size="sm">
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
                variant="outlined"
                name="role"
                label="system"
                // disabled={props.isReadOnly}
                value={ChatGPTMessageRole.system}
              />
              <Radio
                variant="outlined"
                name="role"
                label="user"
                // disabled={props.isReadOnly}
                value={ChatGPTMessageRole.user}
              />
              <Radio
                variant="outlined"
                name="role"
                label="assistant"
                // disabled={props.isReadOnly}
                value={ChatGPTMessageRole.assistant}
              />
            </RadioGroup>
          </FormControl>
        </Section>
        <Section>
          <FormControl size="sm">
            <FormLabel>Message content</FormLabel>
            <Textarea
              color="neutral"
              size="sm"
              variant="outlined"
              minRows={6}
              placeholder="Write JavaScript here"
              // disabled={props.isReadOnly}
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
            <FormHelperText>
              <div>
                <a
                  href="https://mustache.github.io/"
                  target="_blank"
                  rel="noreferrer"
                >
                  Mustache template
                </a>{" "}
                is used here. TL;DR: use{" "}
                <CodeHelperText>{"{{variableName}}"}</CodeHelperText> to insert
                a variable.
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
