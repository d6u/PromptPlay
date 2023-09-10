import IconButton from "@mui/joy/IconButton";
import Chance from "chance";
import { nanoid } from "nanoid";
import { adjust, append, assoc, remove } from "ramda";
import { useMemo, useState } from "react";
import { Position, useUpdateNodeInternals, useNodeId } from "reactflow";
import { FlowState, useFlowStore } from "../flowState";
import {
  DetailPanelContentType,
  NodeID,
  NodeInputItem,
  NodeType,
  OutputNodeConfig,
} from "../flowTypes";
import AddVariableButton from "./shared/AddVariableButton";
import HeaderSection from "./shared/HeaderSection";
import NodeBox from "./shared/NodeBox";
import NodeInputModifyRow from "./shared/NodeInputModifyRow";
import {
  InputHandle,
  Section,
  SmallSection,
  StyledIconGear,
} from "./shared/commonStyledComponents";
import { calculateInputHandleTop } from "./shared/utils";

const chance = new Chance();

const selector = (state: FlowState) => ({
  setDetailPanelContentType: state.setDetailPanelContentType,
  nodeConfigs: state.nodeConfigs,
  updateNodeConfig: state.updateNodeConfig,
  removeNode: state.removeNode,
});

export default function OutputNode() {
  const nodeId = useNodeId() as NodeID;

  const {
    setDetailPanelContentType,
    nodeConfigs,
    updateNodeConfig,
    removeNode,
  } = useFlowStore(selector);

  const nodeConfig = useMemo(
    () => nodeConfigs[nodeId] as OutputNodeConfig | undefined,
    [nodeConfigs, nodeId]
  );

  const updateNodeInternals = useUpdateNodeInternals();

  // It's OK to force unwrap here because nodeConfig will be undefined only
  // when Node is being deleted.
  const [inputs, setInputs] = useState(() => nodeConfig!.inputs);

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
      <NodeBox nodeType={NodeType.OutputNode}>
        <HeaderSection
          title="Output"
          onClickRemove={() => removeNode(nodeId)}
        />
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
              const newInputs = append<NodeInputItem>({
                id: `${nodeId}/${nanoid()}`,
                name: chance.word(),
              })(inputs);

              setInputs(newInputs);

              updateNodeConfig(nodeId, { inputs: newInputs });

              updateNodeInternals(nodeId);
            }}
          />
        </SmallSection>
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
      </NodeBox>
    </>
  );
}
