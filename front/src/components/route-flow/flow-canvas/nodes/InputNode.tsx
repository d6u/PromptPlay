import IconButton from "@mui/joy/IconButton";
import Chance from "chance";
import { adjust, append, assoc, remove } from "ramda";
import { useContext, useMemo, useState } from "react";
import { Position, useNodeId, useUpdateNodeInternals } from "reactflow";
import {
  FlowInputItem,
  InputValueType,
  NodeID,
  NodeType,
  NodeOutputID,
  V3InputNodeConfig,
  VariableType,
} from "../../../../models/flow-content-types";
import randomId from "../../../../utils/randomId";
import FlowContext from "../../FlowContext";
import { useFlowStore } from "../../store/store-flow";
import { selectVariables } from "../../store/store-utils";
import { FlowState } from "../../store/types-local-state";
import { DetailPanelContentType } from "../../store/types-local-state";
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
  variableConfigs: state.variableConfigs,
  updateFlowInputVariable: state.updateFlowInputVariable,
  addFlowInputVariable: state.addFlowInputVariable,
  removeVariableFlowInput: state.removeVariableFlowInput,
  removeNode: state.removeNode,
});

export default function InputNode() {
  const { isCurrentUserOwner } = useContext(FlowContext);

  const nodeId = useNodeId() as NodeID;

  const {
    setDetailPanelContentType,
    nodeConfigs,
    variableConfigs,
    updateFlowInputVariable,
    removeNode,
    addFlowInputVariable,
    removeVariableFlowInput,
  } = useFlowStore(selector);

  const flowInputVariables = selectVariables(
    nodeId,
    VariableType.FlowInput,
    variableConfigs
  );

  const nodeConfig = useMemo(
    () => nodeConfigs[nodeId] as V3InputNodeConfig | undefined,
    [nodeConfigs, nodeId]
  );

  const updateNodeInternals = useUpdateNodeInternals();

  // It's OK to force unwrap here because nodeConfig will be undefined only
  // when Node is being deleted.
  const [outputs, setOutputs] = useState(() => flowInputVariables);

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
                  id: `${nodeId}/${randomId()}` as NodeOutputID,
                  name: chance.word(),
                  valueType: InputValueType.String,
                })(outputs);

                setOutputs(newOutputs);

                addFlowInputVariable(nodeId);

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

                updateFlowInputVariable(nodeId, i, { name });
              }}
              onRemove={() => {
                const newOutputs = remove(i, 1, outputs);

                setOutputs(newOutputs);

                removeVariableFlowInput(nodeId, i);

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
              flowInputVariables.length - 1 - i
            ),
          }}
        />
      ))}
    </>
  );
}
