import Button from "@mui/joy/Button";
import Textarea from "@mui/joy/Textarea";
import Chance from "chance";
import { adjust, append, assoc, remove } from "ramda";
import { useState } from "react";
import { Handle, Position, useUpdateNodeInternals } from "reactflow";
import styled from "styled-components";
import { v4 as uuid } from "uuid";
import {
  CustomNode,
  NodeInputItem,
  RFState,
  useRFStore,
} from "../../../state/flowState";
import NodeInputVariableInput, {
  INPUT_ROW_MARGIN,
} from "../common/NodeInputVariableInput";

const chance = new Chance();

const CONTAINER_BORDER = 1;
const CONTAINER_PADDING = 10;
const VARIABLE_LABEL_HEIGHT = 32;
const HANDLE_RADIUS = 15;
const SECTION_MARGIN_BOTTOM = 10;

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
  margin-bottom: ${SECTION_MARGIN_BOTTOM}px;
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

const selector = (state: RFState) => ({
  onUpdateNode: state.onUpdateNode,
  onRemoveNode: state.onRemoveNode,
});

export default function JavaScriptFunctionNode(props: CustomNode) {
  const updateNodeInternals = useUpdateNodeInternals();

  const { onUpdateNode, onRemoveNode } = useRFStore(selector);

  const [inputs, setInputs] = useState(props.data.inputs);
  const [javaScriptCode, setJavaScriptCode] = useState(
    props.data.javaScriptCode
  );

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
              SECTION_MARGIN_BOTTOM +
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
            color="danger"
            size="sm"
            variant="outlined"
            onClick={() => onRemoveNode(props.id)}
          >
            Remove node
          </Button>
        </Section>
        <Section>
          <Button
            color="success"
            size="sm"
            variant="outlined"
            onClick={() => {
              const newInputs = append<NodeInputItem>({
                id: uuid(),
                value: chance.word(),
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
          {inputs.map((input, i) => (
            <NodeInputVariableInput
              key={input.id}
              name={input.value}
              onConfirmNameChange={(name) => {
                const newInputs = adjust<NodeInputItem>(
                  i,
                  assoc("value", name)
                )(inputs);

                setInputs(newInputs);

                onUpdateNode({
                  id: props.id,
                  data: { ...props.data, inputs: newInputs },
                });
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
                onUpdateNode({
                  id: props.id,
                  data: { ...props.data, javaScriptCode },
                });
              }
            }}
            onBlur={() => {
              onUpdateNode({
                id: props.id,
                data: { ...props.data, javaScriptCode },
              });
            }}
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
