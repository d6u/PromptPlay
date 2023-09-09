import Button from "@mui/joy/Button";
import Chance from "chance";
import { nanoid } from "nanoid";
import { adjust, append, assoc, remove } from "ramda";
import { useState } from "react";
import { Position, useUpdateNodeInternals, NodeProps } from "reactflow";
import { FlowState, useFlowStore } from "../../../state/flowState";
import { NodeInputItem, OutputNodeData } from "../../../static/flowTypes";
import {
  HeaderSection,
  InputHandle,
  Section,
} from "../common/commonStyledComponents";
import { calculateInputHandleTop } from "../common/utils";
import NodeBox from "./NodeBox";
import NodeInputModifyRow from "./NodeInputModifyRow";

const chance = new Chance();

const selector = (state: FlowState) => ({
  onUpdateNode: state.onUpdateNode,
  onRemoveNode: state.onRemoveNode,
});

export default function OutputNode(props: NodeProps<OutputNodeData>) {
  const updateNodeInternals = useUpdateNodeInternals();

  const { onUpdateNode, onRemoveNode } = useFlowStore(selector);

  const [inputs, setInputs] = useState(props.data.inputs);

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
          {inputs.map((input, i) => (
            <NodeInputModifyRow
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
      </NodeBox>
    </>
  );
}
