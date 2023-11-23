import IconButton from "@mui/joy/IconButton";
import Chance from "chance";
import { adjust, append, assoc, remove } from "ramda";
import { useContext, useMemo, useState } from "react";
import { Position, useUpdateNodeInternals, useNodeId } from "reactflow";
import {
  FlowOutputItem,
  NodeInputID,
  NodeID,
  NodeType,
  OutputNodeConfig,
  V3OutputNodeConfig,
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
  setDetailPanelContentType: state.setDetailPanelContentType,
  nodeConfigs: state.nodeConfigs,
  variableConfigs: state.variableConfigs,
  updateFlowOutputVariable: state.updateFlowOutputVariable,
  addFlowOutputVariable: state.addFlowOutputVariable,
  removeVariableFlowOutput: state.removeVariableFlowOutput,
  removeNode: state.removeNode,
});

export default function OutputNode() {
  const { isCurrentUserOwner } = useContext(FlowContext);

  const nodeId = useNodeId() as NodeID;

  const {
    setDetailPanelContentType,
    nodeConfigs,
    variableConfigs,
    updateFlowOutputVariable,
    removeNode,
    addFlowOutputVariable,
    removeVariableFlowOutput,
  } = useFlowStore(selector);

  const nodeConfig = useMemo(
    () => nodeConfigs[nodeId] as V3OutputNodeConfig | undefined,
    [nodeConfigs, nodeId]
  );

  const inputVariables = selectVariables(
    nodeId,
    VariableType.FlowOutput,
    variableConfigs
  );

  const updateNodeInternals = useUpdateNodeInternals();

  // It's OK to force unwrap here because nodeConfig will be undefined only
  // when Node is being deleted.
  const [inputs, setInputs] = useState(() => inputVariables);

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
                const newInputs = append<FlowOutputItem>({
                  id: `${nodeId}/${randomId()}` as NodeInputID,
                  name: chance.word(),
                })(inputs);

                setInputs(newInputs);

                addFlowOutputVariable(nodeId);

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

                updateFlowOutputVariable(nodeId, i, { name });
              }}
              onRemove={() => {
                const newInputs = remove(i, 1, inputs);

                setInputs(newInputs);

                removeVariableFlowOutput(nodeId, i);

                updateNodeInternals(nodeId);
              }}
            />
          ))}
        </Section>
      </NodeBox>
    </>
  );
}
