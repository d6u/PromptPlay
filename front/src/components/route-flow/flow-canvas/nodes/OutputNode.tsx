import IconButton from "@mui/joy/IconButton";
import { useContext, useMemo } from "react";
import { Position, useNodeId, useUpdateNodeInternals } from "reactflow";
import { NodeID, NodeType } from "../../../../models/v2-flow-content-types";
import {
  V3OutputNodeConfig,
  VariableType,
} from "../../../../models/v3-flow-content-types";
import FlowContext from "../../FlowContext";
import { selectVariables } from "../../state/state-utils";
import { useFlowStore } from "../../state/store-flow-state";
import {
  DetailPanelContentType,
  FlowState,
} from "../../state/store-flow-state-types";
import AddVariableButton from "./node-common/AddVariableButton";
import HeaderSection from "./node-common/HeaderSection";
import {
  InputHandle,
  Section,
  SmallSection,
  StyledIconGear,
} from "./node-common/node-common";
import NodeBox from "./node-common/NodeBox";
import NodeInputModifyRow from "./node-common/NodeInputModifyRow";
import { calculateInputHandleTop } from "./node-common/utils";

const selector = (state: FlowState) => ({
  setDetailPanelContentType: state.setDetailPanelContentType,
  nodeConfigs: state.nodeConfigDict,
  variableConfigs: state.variableDict,
  addVariable: state.addVariable,
  updateVariable: state.updateVariable,
  removeVariable: state.removeVariable,
  removeNode: state.removeNode,
});

export default function OutputNode() {
  const { isCurrentUserOwner } = useContext(FlowContext);

  const nodeId = useNodeId() as NodeID;

  const {
    setDetailPanelContentType,
    nodeConfigs,
    variableConfigs,
    removeNode,
    addVariable,
    updateVariable,
    removeVariable,
  } = useFlowStore(selector);

  const nodeConfig = useMemo(
    () => nodeConfigs[nodeId] as V3OutputNodeConfig | undefined,
    [nodeConfigs, nodeId],
  );

  const flowOutputs = useMemo(() => {
    return selectVariables(nodeId, VariableType.FlowOutput, variableConfigs);
  }, [nodeId, variableConfigs]);

  const updateNodeInternals = useUpdateNodeInternals();

  if (!nodeConfig) {
    return null;
  }

  return (
    <>
      {flowOutputs.map((output, i) => (
        <InputHandle
          key={i}
          type="target"
          id={output.id}
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
                DetailPanelContentType.EvaluationModeSimple,
              )
            }
          >
            <StyledIconGear />
          </IconButton>
          {isCurrentUserOwner && (
            <AddVariableButton
              onClick={() => {
                addVariable(
                  nodeId,
                  VariableType.FlowOutput,
                  flowOutputs.length,
                );
                updateNodeInternals(nodeId);
              }}
            />
          )}
        </SmallSection>
        <Section>
          {flowOutputs.map((input, i) => (
            <NodeInputModifyRow
              key={input.id}
              name={input.name}
              isReadOnly={!isCurrentUserOwner}
              onConfirmNameChange={(name) => {
                updateVariable(input.id, { name });
              }}
              onRemove={() => {
                removeVariable(input.id);
                updateNodeInternals(nodeId);
              }}
            />
          ))}
        </Section>
      </NodeBox>
    </>
  );
}
