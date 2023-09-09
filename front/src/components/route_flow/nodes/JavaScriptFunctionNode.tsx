import Button from "@mui/joy/Button";
import Textarea from "@mui/joy/Textarea";
import Chance from "chance";
import { nanoid } from "nanoid";
import { adjust, append, assoc, remove } from "ramda";
import { useMemo, useState } from "react";
import { Position, useUpdateNodeInternals, useNodeId } from "reactflow";
import { FlowState, useFlowStore } from "../flowState";
import {
  JavaScriptFunctionNodeConfig,
  NodeID,
  NodeInputItem,
  NodeType,
} from "../flowTypes";
import NodeBox from "./shared/NodeBox";
import NodeInputModifyRow from "./shared/NodeInputModifyRow";
import NodeOutputRow from "./shared/NodeOutputRow";
import {
  HeaderSection,
  InputHandle,
  OutputHandle,
  Section,
} from "./shared/commonStyledComponents";
import { calculateInputHandleTop } from "./shared/utils";

const chance = new Chance();

const selector = (state: FlowState) => ({
  nodeConfigs: state.nodeConfigs,
  updateNodeConfig: state.updateNodeConfig,
  removeNode: state.removeNode,
});

export default function JavaScriptFunctionNode() {
  const nodeId = useNodeId() as NodeID;

  const { nodeConfigs, updateNodeConfig, removeNode } = useFlowStore(selector);

  const nodeConfig = useMemo(
    () => nodeConfigs[nodeId] as JavaScriptFunctionNodeConfig | undefined,
    [nodeConfigs, nodeId]
  );

  const updateNodeInternals = useUpdateNodeInternals();

  // It's OK to force unwrap here because nodeConfig will be undefined only
  // when Node is being deleted.
  const [inputs, setInputs] = useState(() => nodeConfig!.inputs);
  const [javaScriptCode, setJavaScriptCode] = useState(
    () => nodeConfig!.javaScriptCode
  );

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
      <NodeBox nodeType={NodeType.JavaScriptFunctionNode}>
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

                updateNodeConfig(nodeId, { inputs: newInputs });
              }}
              onRemove={() => {
                const newInputs = remove(i, 1, inputs);

                setInputs(newInputs);

                updateNodeConfig(nodeId, { inputs: newInputs });

                updateNodeInternals(nodeId);
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
                updateNodeConfig(nodeId, { javaScriptCode });
              }
            }}
            onBlur={() => {
              updateNodeConfig(nodeId, { javaScriptCode });
            }}
          />
          <code>{"}"}</code>
        </Section>
        <Section>
          <NodeOutputRow
            id={nodeConfig.outputs[0].id}
            name={nodeConfig.outputs[0].name}
            value={nodeConfig.outputs[0].value}
          />
        </Section>
      </NodeBox>
      <OutputHandle
        type="source"
        id={nodeConfig.outputs[0].id}
        position={Position.Right}
      />
    </>
  );
}
