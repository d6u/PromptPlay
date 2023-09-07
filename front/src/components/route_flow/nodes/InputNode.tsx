import Button from "@mui/joy/Button";
import Chance from "chance";
import { nanoid } from "nanoid";
import { adjust, append, assoc, remove } from "ramda";
import { useState } from "react";
import { Position, useUpdateNodeInternals, NodeProps } from "reactflow";
import { RFState, useRFStore } from "../../../state/flowState";
import { InputNodeData, NodeOutputItem } from "../../../static/flowTypes";
import {
  HeaderSection,
  OutputHandle,
  Section,
} from "../common/commonStyledComponents";
import { calculateOutputHandleBottom } from "../common/utils";
import NodeBox from "./NodeBox";
import NodeInputItemRow from "./NodeInputItemRow";

const chance = new Chance();

const selector = (state: RFState) => ({
  onUpdateNode: state.onUpdateNode,
  onRemoveNode: state.onRemoveNode,
});

export default function InputNode(props: NodeProps<InputNodeData>) {
  const updateNodeInternals = useUpdateNodeInternals();

  const { onUpdateNode, onRemoveNode } = useRFStore(selector);

  const [outputs, setOutputs] = useState(props.data.outputs);

  return (
    <>
      <NodeBox>
        <HeaderSection>
          <Button
            color="success"
            size="sm"
            variant="outlined"
            onClick={() => {
              const newOutputs = append<NodeOutputItem>({
                id: `${props.id}/${nanoid()}`,
                name: chance.word(),
                value: "",
              })(outputs);

              setOutputs(newOutputs);

              onUpdateNode({
                id: props.id,
                data: { ...props.data, outputs: newOutputs },
              });

              updateNodeInternals(props.id);
            }}
          >
            Add output
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
          {outputs.map((output, i) => (
            <NodeInputItemRow
              key={output.id}
              name={output.name}
              onConfirmNameChange={(name) => {
                const newInputs = adjust<NodeOutputItem>(
                  i,
                  assoc("name", name)<NodeOutputItem>
                )(outputs);

                setOutputs(newInputs);

                onUpdateNode({
                  id: props.id,
                  data: { ...props.data, outputs: newInputs },
                });
              }}
              onRemove={() => {
                const newOutputs = remove(i, 1, outputs);

                setOutputs(newOutputs);

                onUpdateNode({
                  id: props.id,
                  data: { ...props.data, outputs: newOutputs },
                });

                updateNodeInternals(props.id);
              }}
            />
          ))}
        </Section>
      </NodeBox>
      {outputs.map((output, i) => (
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
