import Button from "@mui/joy/Button";
import Chance from "chance";
import { nanoid } from "nanoid";
import { adjust, append, assoc, remove } from "ramda";
import { useMemo, useState } from "react";
import { Position, useNodeId, useUpdateNodeInternals } from "reactflow";
import { FlowState, useFlowStore } from "../../../state/flowState";
import {
  InputNodeConfig,
  NodeID,
  NodeOutputItem,
} from "../../../static/flowTypes";
import {
  HeaderSection,
  OutputHandle,
  Section,
} from "../common/commonStyledComponents";
import { calculateOutputHandleBottom } from "../common/utils";
import NodeBox from "./NodeBox";
import NodeOutputModifyRow from "./NodeOutputModifyRow";

const chance = new Chance();

const selector = (state: FlowState) => ({
  nodeConfigs: state.nodeConfigs,
  updateNodeConfig: state.updateNodeConfig,
  removeNode: state.removeNode,
});

export default function InputNode() {
  const nodeId = useNodeId() as NodeID;

  const { nodeConfigs, updateNodeConfig, removeNode } = useFlowStore(selector);

  const nodeConfig = useMemo(
    () => nodeConfigs[nodeId] as InputNodeConfig | undefined,
    [nodeConfigs, nodeId]
  );

  const updateNodeInternals = useUpdateNodeInternals();

  // It's OK to force unwrap here because nodeConfig will be undefined only
  // when Node is being deleted.
  const [outputs, setOutputs] = useState(nodeConfig!.outputs);

  if (!nodeConfig) {
    return null;
  }

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
                id: `${nodeId}/${nanoid()}`,
                name: chance.word(),
                value: "",
              })(outputs!);

              setOutputs(newOutputs);

              updateNodeConfig(nodeId, {
                outputs: newOutputs,
              });

              updateNodeInternals(nodeId);
            }}
          >
            Add output
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
          {outputs.map((output, i) => (
            <NodeOutputModifyRow
              key={output.id}
              name={output.name}
              onConfirmNameChange={(name) => {
                const newOutputs = adjust<NodeOutputItem>(
                  i,
                  assoc("name", name)<NodeOutputItem>
                )(outputs);

                setOutputs(newOutputs);

                updateNodeConfig(nodeId, { outputs: newOutputs });
              }}
              onRemove={() => {
                const newOutputs = remove(i, 1, outputs);

                setOutputs(newOutputs);

                updateNodeConfig(nodeId, { outputs: newOutputs });

                updateNodeInternals(nodeId);
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
              nodeConfig.outputs.length - 1 - i
            ),
          }}
        />
      ))}
    </>
  );
}
