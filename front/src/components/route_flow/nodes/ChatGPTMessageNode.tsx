import Button from "@mui/joy/Button";
import Radio from "@mui/joy/Radio";
import RadioGroup from "@mui/joy/RadioGroup";
import Textarea from "@mui/joy/Textarea";
import Chance from "chance";
import { nanoid } from "nanoid";
import { adjust, append, assoc, remove } from "ramda";
import { useState } from "react";
import { Position, useUpdateNodeInternals, NodeProps } from "reactflow";
import { RFState, useRFStore } from "../../../state/flowState";
import {
  ChatGPTMessageNodeData,
  ChatGPTMessageRole,
  NodeInputItem,
} from "../../../static/flowTypes";
import {
  HeaderSection,
  InputHandle,
  OutputHandle,
  OutputLabel,
  OutputName,
  OutputValue,
  Section,
} from "../common/commonStyledComponents";
import {
  calculateInputHandleTop,
  calculateOutputHandleBottom,
} from "../common/utils";
import NodeBox from "./NodeBox";
import NodeInputItemRow from "./NodeInputItemRow";

const chance = new Chance();

const selector = (state: RFState) => ({
  onUpdateNode: state.onUpdateNode,
  onRemoveNode: state.onRemoveNode,
});

export default function ChatGPTMessageNode(
  props: NodeProps<ChatGPTMessageNodeData>
) {
  const updateNodeInternals = useUpdateNodeInternals();

  const { onUpdateNode, onRemoveNode } = useRFStore(selector);

  const [inputs, setInputs] = useState(props.data.inputs);
  const [content, setContent] = useState(props.data.content);
  const [role, setRole] = useState(props.data.role);

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
                id: `${props.id}/${nanoid()}`,
                name: chance.word(),
              })(inputs);

              setInputs(newInputs);

              onUpdateNode({
                id: props.id,
                data: { ...props.data, inputs: newInputs },
              });

              updateNodeInternals(props.id);
            }}
          >
            Add input
          </Button>
          <Button
            color="danger"
            size="sm"
            variant="outlined"
            onClick={() => onRemoveNode(props.id)}
          >
            Remove node
          </Button>
        </HeaderSection>
        <Section>
          {inputs.map((input, i) => {
            if (i === 0) {
              return (
                <NodeInputItemRow key={input.id} name={input.name} isReadOnly />
              );
            }

            return (
              <NodeInputItemRow
                key={input.id}
                name={input.name}
                onConfirmNameChange={(name) => {
                  const newInputs = adjust<NodeInputItem>(
                    i,
                    assoc("name", name)<NodeInputItem>
                  )(inputs);

                  setInputs(newInputs);

                  onUpdateNode({
                    id: props.id,
                    data: { ...props.data, inputs: newInputs },
                  });
                }}
                onRemove={() => {
                  const newInputs = remove(i, 1, inputs);

                  setInputs(newInputs);

                  onUpdateNode({
                    id: props.id,
                    data: { ...props.data, inputs: newInputs },
                  });

                  updateNodeInternals(props.id);
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

              onUpdateNode({
                id: props.id,
                data: { ...props.data, role },
              });
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
                onUpdateNode({
                  id: props.id,
                  data: { ...props.data, content },
                });
              }
            }}
            onBlur={() => {
              onUpdateNode({
                id: props.id,
                data: { ...props.data, content },
              });
            }}
          />
        </Section>
        <Section>
          {props.data.outputs.map((output, i) => (
            <OutputLabel key={output.id}>
              <OutputName>{output.name} =&nbsp;</OutputName>
              <OutputValue>{JSON.stringify(output.value)}</OutputValue>
            </OutputLabel>
          ))}
        </Section>
      </NodeBox>
      {props.data.outputs.map((output, i) => (
        <OutputHandle
          key={output.id}
          type="source"
          id={output.id}
          position={Position.Right}
          style={{
            bottom: calculateOutputHandleBottom(
              props.data.outputs.length - 1 - i
            ),
          }}
        />
      ))}
    </>
  );
}
