import Button from "@mui/joy/Button";
import Textarea from "@mui/joy/Textarea";
import Chance from "chance";
import { nanoid } from "nanoid";
import { adjust, append, assoc, remove } from "ramda";
import { useState } from "react";
import { Position, useUpdateNodeInternals, NodeProps } from "reactflow";
import { RFState, useRFStore } from "../../../state/flowState";
import {
  JavaScriptFunctionNodeData,
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
import { calculateInputHandleTop } from "../common/utils";
import NodeBox from "./NodeBox";
import NodeInputItemRow from "./NodeInputItemRow";

const chance = new Chance();

const selector = (state: RFState) => ({
  onUpdateNode: state.onUpdateNode,
  onRemoveNode: state.onRemoveNode,
});

export default function JavaScriptFunctionNode(
  props: NodeProps<JavaScriptFunctionNodeData>
) {
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
          ))}
        </Section>
        <Section>
          <code>{`function (${inputs.map((v) => v.name).join(", ")}) {`}</code>
          <Textarea
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
          <OutputLabel>
            <OutputName>{props.data.outputs[0].name} =&nbsp;</OutputName>
            <OutputValue>
              {JSON.stringify(props.data.outputs[0].value)}
            </OutputValue>
          </OutputLabel>
        </Section>
      </NodeBox>
      <OutputHandle
        type="source"
        id={props.data.outputs[0].id}
        position={Position.Right}
      />
    </>
  );
}
