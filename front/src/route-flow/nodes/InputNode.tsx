import IconButton from "@mui/joy/IconButton";
import Chance from "chance";
import { nanoid } from "nanoid";
import { adjust, append, assoc, remove } from "ramda";
import { useMemo, useState } from "react";
import { Position, useNodeId, useUpdateNodeInternals } from "reactflow";
import {
  FlowInputItem,
  InputNodeConfig,
  InputValueType,
  NodeID,
  NodeType,
  OutputID,
} from "../flowTypes";
import { useFlowStore } from "../store/flowStore";
import { DetailPanelContentType, FlowState } from "../store/storeTypes";
import AddVariableButton from "./node-common/AddVariableButton";
import HeaderSection from "./node-common/HeaderSection";
import NodeBox from "./node-common/NodeBox";
import NodeOutputModifyRow from "./node-common/NodeOutputModifyRow";
import {
  OutputHandle,
  Section,
  SmallSection,
  StyledIconGear,
} from "./node-common/node-common";
import { calculateOutputHandleBottom } from "./node-common/utils";

const chance = new Chance();

const selector = (state: FlowState) => ({
  isCurrentUserOwner: state.isCurrentUserOwner,
  setDetailPanelContentType: state.setDetailPanelContentType,
  nodeConfigs: state.nodeConfigs,
  updateNodeConfig: state.updateNodeConfig,
  removeNode: state.removeNode,
});

export default function InputNode() {
  const nodeId = useNodeId() as NodeID;

  const {
    isCurrentUserOwner,
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
        <HeaderSection
          isCurrentUserOwner={isCurrentUserOwner}
          title="Input"
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
                const newOutputs = append<FlowInputItem>({
                  id: `${nodeId}/${nanoid()}` as OutputID,
                  name: chance.word(),
                  value: "",
                  valueType: InputValueType.String,
                })(outputs);

                setOutputs(newOutputs);

                updateNodeConfig(nodeId, {
                  outputs: newOutputs,
                });

                updateNodeInternals(nodeId);
              }}
            />
          )}
        </SmallSection>
        <Section>
          {outputs.map((output, i) => (
            <NodeOutputModifyRow
              key={output.id}
              name={output.name}
              isReadOnly={!isCurrentUserOwner}
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
