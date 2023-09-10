import IconButton from "@mui/joy/IconButton";
import Chance from "chance";
import { nanoid } from "nanoid";
import { adjust, append, assoc, remove } from "ramda";
import { useMemo, useState } from "react";
import { Position, useNodeId, useUpdateNodeInternals } from "reactflow";
import { FlowState, useFlowStore } from "../flowState";
import { DetailPanelContentType } from "../flowState";
import {
  FlowInputItem,
  InputNodeConfig,
  InputValueType,
  NodeID,
  NodeType,
} from "../flowTypes";
import AddVariableButton from "./shared/AddVariableButton";
import HeaderSection from "./shared/HeaderSection";
import NodeBox from "./shared/NodeBox";
import NodeOutputModifyRow from "./shared/NodeOutputModifyRow";
import {
  OutputHandle,
  Section,
  SmallSection,
  StyledIconGear,
} from "./shared/commonStyledComponents";
import { calculateOutputHandleBottom } from "./shared/utils";

const chance = new Chance();

const selector = (state: FlowState) => ({
  setDetailPanelContentType: state.setDetailPanelContentType,
  nodeConfigs: state.nodeConfigs,
  updateNodeConfig: state.updateNodeConfig,
  removeNode: state.removeNode,
});

export default function InputNode() {
  const nodeId = useNodeId() as NodeID;

  const {
    setDetailPanelContentType,
    nodeConfigs,
    updateNodeConfig,
    removeNode,
  } = useFlowStore(selector);

  const nodeConfig = useMemo(
    () => nodeConfigs[nodeId] as InputNodeConfig | undefined,
    [nodeConfigs, nodeId]
  );

  const updateNodeInternals = useUpdateNodeInternals();

  // It's OK to force unwrap here because nodeConfig will be undefined only
  // when Node is being deleted.
  const [outputs, setOutputs] = useState(() => nodeConfig!.outputs);

  if (!nodeConfig) {
    return null;
  }

  return (
    <>
      <NodeBox nodeType={NodeType.InputNode}>
        <HeaderSection title="Input" onClickRemove={() => removeNode(nodeId)} />
        <SmallSection>
          <IconButton
            size="sm"
            variant="outlined"
            onClick={() =>
              setDetailPanelContentType(DetailPanelContentType.FlowConfig)
            }
          >
            <StyledIconGear />
          </IconButton>
          <AddVariableButton
            onClick={() => {
              const newOutputs = append<FlowInputItem>({
                id: `${nodeId}/${nanoid()}`,
                name: chance.word(),
                value: "",
                valueType: InputValueType.String,
              })(outputs!);

              setOutputs(newOutputs);

              updateNodeConfig(nodeId, {
                outputs: newOutputs,
              });

              updateNodeInternals(nodeId);
            }}
          />
        </SmallSection>
        <Section>
          {outputs.map((output, i) => (
            <NodeOutputModifyRow
              key={output.id}
              name={output.name}
              onConfirmNameChange={(name) => {
                const newOutputs = adjust<FlowInputItem>(
                  i,
                  assoc("name", name)<FlowInputItem>
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
