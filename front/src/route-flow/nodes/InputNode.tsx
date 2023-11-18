import IconButton from "@mui/joy/IconButton";
import Chance from "chance";
import { adjust, append, assoc, remove } from "ramda";
import { useContext, useMemo, useState } from "react";
import { Position, useNodeId, useUpdateNodeInternals } from "reactflow";
import randomId from "../../util/randomId";
import FlowContext from "../FlowContext";
import { useFlowStore } from "../store/store-flow";
import {
  FlowInputItem,
  InputNodeConfig,
  InputValueType,
  NodeID,
  NodeType,
  OutputID,
} from "../store/types-flow-content";
import { FlowState } from "../store/types-local-state";
import { DetailPanelContentType } from "../store/types-local-state";
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
  setDetailPanelContentType: state.setDetailPanelContentType,
  nodeConfigs: state.nodeConfigs,
  updateNodeConfig: state.updateNodeConfig,
  removeNode: state.removeNode,
  v2_removeNode: state.v2_removeNode,
  v2_addOutputVariable: state.v2_addOutputVariable,
  v2_removeOutputVariable: state.v2_removeOutputVariable,
});

export default function InputNode() {
  const { isCurrentUserOwner } = useContext(FlowContext);

  const nodeId = useNodeId() as NodeID;

  const {
    setDetailPanelContentType,
    nodeConfigs,
    updateNodeConfig,
    removeNode,
    v2_removeNode,
    v2_addOutputVariable,
    v2_removeOutputVariable,
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
          onClickRemove={() => {
            removeNode(nodeId);
            v2_removeNode(nodeId);
          }}
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
                  id: `${nodeId}/${randomId()}` as OutputID,
                  name: chance.word(),
                  valueType: InputValueType.String,
                })(outputs);

                setOutputs(newOutputs);

                updateNodeConfig(nodeId, {
                  outputs: newOutputs,
                });
                v2_addOutputVariable(nodeId);

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
                v2_removeOutputVariable(nodeId, i);

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
