import IconButton from "@mui/joy/IconButton";
import Chance from "chance";
import { nanoid } from "nanoid";
import { adjust, append, assoc, remove } from "ramda";
import { useMemo, useState } from "react";
import { Position, useUpdateNodeInternals, useNodeId } from "reactflow";
import {
  FlowOutputItem,
  InputID,
  NodeID,
  NodeType,
  OutputNodeConfig,
} from "../flowTypes";
import { useFlowStore } from "../store/flowStore";
import { DetailPanelContentType, FlowState } from "../store/storeTypes";
import AddVariableButton from "./node-common/AddVariableButton";
import HeaderSection from "./node-common/HeaderSection";
import NodeBox from "./node-common/NodeBox";
import NodeInputModifyRow from "./node-common/NodeInputModifyRow";
import {
  InputHandle,
  Section,
  SmallSection,
  StyledIconGear,
} from "./node-common/node-common";
import { calculateInputHandleTop } from "./node-common/utils";

const chance = new Chance();

const selector = (state: FlowState) => ({
  isCurrentUserOwner: state.isCurrentUserOwner,
  setDetailPanelContentType: state.setDetailPanelContentType,
  nodeConfigs: state.nodeConfigs,
  updateNodeConfig: state.updateNodeConfig,
  removeNode: state.removeNode,
});

export default function OutputNode() {
  const nodeId = useNodeId() as NodeID;

  const {
    isCurrentUserOwner,
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
          isCurrentUserOwner={isCurrentUserOwner}
          title="Output"
          onClickRemove={() => removeNode(nodeId)}
        />
        <SmallSection>
          <IconButton
            variant="outlined"
            onClick={() =>
              setDetailPanelContentType(
                DetailPanelContentType.EvaluationModeSimple
              )
            }
          >
            <StyledIconGear />
          </IconButton>
          {isCurrentUserOwner && (
            <AddVariableButton
              onClick={() => {
                const newInputs = append<FlowOutputItem>({
                  id: `${nodeId}/${nanoid()}` as InputID,
                  name: chance.word(),
                  value: null,
                })(inputs);

                setInputs(newInputs);

                updateNodeConfig(nodeId, { inputs: newInputs });

                updateNodeInternals(nodeId);
              }}
            />
          )}
        </SmallSection>
        <Section>
          {inputs.map((input, i) => (
            <NodeInputModifyRow
              key={input.id}
              name={input.name}
              isReadOnly={!isCurrentUserOwner}
              onConfirmNameChange={(name) => {
                const newInputs = adjust<FlowOutputItem>(
                  i,
                  assoc("name", name)<FlowOutputItem>
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
