import Button from "@mui/joy/Button";
import Radio from "@mui/joy/Radio";
import RadioGroup from "@mui/joy/RadioGroup";
import Textarea from "@mui/joy/Textarea";
import Chance from "chance";
import { nanoid } from "nanoid";
import { adjust, append, assoc, remove } from "ramda";
import { useMemo, useState } from "react";
import { Position, useUpdateNodeInternals, useNodeId } from "reactflow";
import { FlowState, useFlowStore } from "../../../state/flowState";
import {
  ChatGPTMessageNodeConfig,
  ChatGPTMessageRole,
  NodeID,
  NodeInputItem,
} from "../../../static/flowTypes";
import NodeBox from "./shared/NodeBox";
import NodeInputModifyRow from "./shared/NodeInputModifyRow";
import NodeOutputRow from "./shared/NodeOutputRow";
import {
  HeaderSection,
  InputHandle,
  OutputHandle,
  Section,
} from "./shared/commonStyledComponents";
import {
  calculateInputHandleTop,
  calculateOutputHandleBottom,
} from "./shared/utils";

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
      {inputs.map((input, i) => (
        <InputHandle
          key={i}
          type="target"
          id={input.id}
          position={Position.Left}
          style={{ top: calculateInputHandleTop(i) }}
        />
      ))}
      <NodeBox>
        <HeaderSection>
          <Button
            color="success"
            size="sm"
            variant="outlined"
            onClick={() => {
              const newInputs = append<NodeInputItem>({
                id: `${nodeId}/${nanoid()}`,
                name: chance.word(),
              })(inputs);

              setInputs(newInputs);

              updateNodeConfig(nodeId, { inputs: newInputs });

              updateNodeInternals(nodeId);
            }}
          >
            Add input
          </Button>
          <Button
            color="danger"
            size="sm"
            variant="outlined"
            onClick={() => removeNode(nodeId)}
          >
            Remove node
          </Button>
        </HeaderSection>
        <Section>
          {inputs.map((input, i) => {
            if (i === 0) {
              return (
                <NodeInputModifyRow
                  key={input.id}
                  name={input.name}
                  isReadOnly
                />
              );
            }

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
              size="sm"
              variant="outlined"
              name="role"
              label="system"
              // disabled={props.isReadOnly}
              value={ChatGPTMessageRole.system}
            />
            <Radio
              size="sm"
              variant="outlined"
              name="role"
              label="user"
              // disabled={props.isReadOnly}
              value={ChatGPTMessageRole.user}
            />
            <Radio
              size="sm"
              variant="outlined"
              name="role"
              label="assistant"
              // disabled={props.isReadOnly}
              value={ChatGPTMessageRole.assistant}
            />
          </RadioGroup>
        </Section>
        <Section>
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
