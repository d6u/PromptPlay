import Button from "@mui/joy/Button";
import Textarea from "@mui/joy/Textarea";
import Chance from "chance";
import { adjust, append, assoc, remove } from "ramda";
import { useState } from "react";
import { Handle, Position, useUpdateNodeInternals } from "reactflow";
import styled from "styled-components";
import { v4 as uuid } from "uuid";
import NodeInputVariableInput, {
  INPUT_ROW_MARGIN,
} from "../common/NodeInputVariableInput";
import { NodeData, NodeInputItem } from "../nodeTypes";

const chance = new Chance();

const CONTAINER_BORDER = 1;
const CONTAINER_PADDING = 10;
const VARIABLE_LABEL_HEIGHT = 32;
const HANDLE_RADIUS = 15;

const StyledHandle = styled(Handle)`
  width: ${HANDLE_RADIUS}px;
  height: ${HANDLE_RADIUS}px;
  background: #5cc5e0;
  transform: none;
`;

const InputHandle = styled(StyledHandle)`
  left: -${HANDLE_RADIUS / 2}px;
`;

const OutputHandle = styled(StyledHandle)`
  top: unset;
  right: -${HANDLE_RADIUS / 2}px;
  bottom: ${CONTAINER_PADDING +
  VARIABLE_LABEL_HEIGHT / 2 -
  HANDLE_RADIUS / 2}px;
`;

const Content = styled.div`
  background: #fff;
  border: ${CONTAINER_BORDER}px solid #000;
  border-radius: 5px;
  padding: ${CONTAINER_PADDING}px;
`;

const Section = styled.div`
  margin-bottom: 10px;
  max-width: 400px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const CodeTextarea = styled(Textarea)`
  width: 400px;
`;

const OutputLabel = styled.code`
  display: block;
  height: ${VARIABLE_LABEL_HEIGHT}px;
  line-height: ${VARIABLE_LABEL_HEIGHT}px;
  text-align: right;
`;

type Props = {
  id: string;
  data: NodeData;
};

export default function JavaScriptFunctionNode(props: Props) {
  const updateNodeInternals = useUpdateNodeInternals();

  const [inputs, setInputs] = useState<NodeInputItem[]>([]);
  const [javaScriptCode, setJavaScriptCode] = useState("");

  return (
    <>
      {inputs.map((input, i) => (
        <InputHandle
          key={i}
          type="target"
          id={`${props.id}:input:${input.id}`}
          position={Position.Left}
          style={{
            top:
              CONTAINER_BORDER +
              CONTAINER_PADDING +
              VARIABLE_LABEL_HEIGHT +
              INPUT_ROW_MARGIN +
              (INPUT_ROW_MARGIN + VARIABLE_LABEL_HEIGHT) * i +
              VARIABLE_LABEL_HEIGHT / 2 -
              HANDLE_RADIUS / 2,
          }}
        />
      ))}
      <Content>
        <Section>
          <Button
            color="success"
            size="sm"
            variant="outlined"
            onClick={() => {
              setInputs((inputs) =>
                append({ id: uuid(), value: chance.word() }, inputs)
              );
              updateNodeInternals(props.id);
            }}
          >
            Add
          </Button>
          {inputs.map((input, i) => (
            <NodeInputVariableInput
              key={input.id}
              name={input.value}
              onConfirmNameChange={(name) => {
                setInputs(
                  (inputs) =>
                    adjust(i, assoc("value", name), inputs) as NodeInputItem[]
                );
              }}
              onRemove={() => {
                setInputs((inputs) => remove(i, 1, inputs));
                updateNodeInternals(props.id);
              }}
            />
          ))}
        </Section>
        <Section>
          <code>{`function (${inputs.map((v) => v.value).join(", ")}) {`}</code>
          <CodeTextarea
            sx={{ fontFamily: "var(--mono-font-family)" }}
            color="neutral"
            size="sm"
            variant="outlined"
            minRows={6}
            placeholder="Write JavaScript here"
            // disabled={props.isReadOnly}
            value={javaScriptCode}
            onChange={(e) => {
              setJavaScriptCode(e.target.value);
            }}
            onKeyDown={(e) => {
              if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
                // props.onSaveJavaScriptCode(javaScriptCode);
              }
            }}
            // onBlur={() => props.onSaveJavaScriptCode(javaScriptCode)}
          />
          <code>{"}"}</code>
        </Section>
        <Section>
          <OutputLabel>Output</OutputLabel>
        </Section>
      </Content>
      <OutputHandle
        type="source"
        id={`${props.id}:output`}
        position={Position.Right}
      />
    </>
  );
}
