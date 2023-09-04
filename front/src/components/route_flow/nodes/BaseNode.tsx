import Button from "@mui/joy/Button";
import Chance from "chance";
import { adjust, append, assoc, remove, update } from "ramda";
import { useCallback, useState } from "react";
import { Handle, Position, useUpdateNodeInternals } from "reactflow";
import styled from "styled-components";
import { v4 as uuid } from "uuid";
import NodeInputVariableInput from "../common/NodeInputVariableInput";
import { NodeData, NodeInputItem } from "../nodeTypes";

const chance = new Chance();

const CONTAINER_PADDING = 10;
const INPUT_HEIGHT = 32;
const INPUT_MARGIN_BOTTOM = 10;
const HANDLE_HEIGHT = 15;

const Content = styled.div`
  background: #fff;
  border: 1px solid #000;
  border-radius: 5px;
  padding: ${CONTAINER_PADDING}px;
`;

const InputHandle = styled(Handle)`
  width: ${HANDLE_HEIGHT}px;
  height: ${HANDLE_HEIGHT}px;
  left: -${HANDLE_HEIGHT / 2}px;
  transform: none;
  background: #5cc5e0;
`;

type Props = {
  id: string;
  data: NodeData;
};

export default function BaseNode(props: Props) {
  const updateNodeInternals = useUpdateNodeInternals();

  const [inputs, setInputs] = useState<NodeInputItem[]>([]);

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
              CONTAINER_PADDING +
              (INPUT_MARGIN_BOTTOM + INPUT_HEIGHT) * i +
              INPUT_HEIGHT / 2 -
              HANDLE_HEIGHT / 2,
          }}
        />
      ))}
      <Content>
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
      </Content>
      {/* <Handle
        type="source"
        position={Position.Right}
        id="b"
        style={handleStyle}
      /> */}
    </>
  );
}
