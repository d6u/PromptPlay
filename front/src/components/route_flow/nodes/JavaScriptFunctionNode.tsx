import Button from "@mui/joy/Button";
import Textarea from "@mui/joy/Textarea";
import Chance from "chance";
import { nanoid } from "nanoid";
import { adjust, append, assoc, remove } from "ramda";
import { useState } from "react";
import { Handle, Position, useUpdateNodeInternals, NodeProps } from "reactflow";
import styled from "styled-components";
import { RFState, useRFStore } from "../../../state/flowState";
import { NodeData, NodeInputItem } from "../../../static/flowTypes";
import NodeInputVariableInput, {
  INPUT_ROW_MARGIN,
} from "../common/NodeInputVariableInput";

const chance = new Chance();

const CONTAINER_BORDER = 1;
const CONTAINER_PADDING = 10;
const VARIABLE_LABEL_HEIGHT = 32;
const SECTION_MARGIN_BOTTOM = 10;
const HANDLE_RADIUS = 15;

function calculateInputHandleTop(i: number): number {
  return (
    CONTAINER_BORDER +
    CONTAINER_PADDING +
    VARIABLE_LABEL_HEIGHT +
    SECTION_MARGIN_BOTTOM +
    (INPUT_ROW_MARGIN + VARIABLE_LABEL_HEIGHT) * i +
    VARIABLE_LABEL_HEIGHT / 2 -
    HANDLE_RADIUS / 2
  );
}

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

const HeaderSection = styled(Section)`
  display: flex;
  justify-content: space-between;
`;

const CodeTextarea = styled(Textarea)`
  width: 400px;
`;

const OutputLabel = styled.div`
  padding: 0 10px;
  border: 1px solid blue;
  height: ${VARIABLE_LABEL_HEIGHT}px;
  display: flex;
  border-radius: 5px;
  align-items: center;
  justify-content: space-between;
  // line-height: ${VARIABLE_LABEL_HEIGHT}px;
  // font-family: var(--mono-font-family);
  // font-size: 14px;
`;

const OutputName = styled.code`
  white-space: nowrap;
`;

const OutputValue = styled.code`
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
`;

const selector = (state: RFState) => ({
  onUpdateNode: state.onUpdateNode,
  onRemoveNode: state.onRemoveNode,
});

export default function JavaScriptFunctionNode(props: NodeProps<NodeData>) {
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
          id={input.id}
          position={Position.Left}
          style={{
            top: calculateInputHandleTop(i),
          }}
        />
      ))}
      <Content>
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
          {inputs.map((input, i) => (
            <NodeInputVariableInput
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
          ))}
        </Section>
        <Section>
          <code>{`function (${inputs.map((v) => v.name).join(", ")}) {`}</code>
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
          {props.data.outputs.map((output, i) => (
            <OutputLabel key={output.id}>
              <OutputName>{output.name} =&nbsp;</OutputName>
              <OutputValue>{output.value}</OutputValue>
            </OutputLabel>
          ))}
        </Section>
      </Content>
      <OutputHandle
        type="source"
        id={props.data.outputs[0].id}
        position={Position.Right}
      />
    </>
  );
}
