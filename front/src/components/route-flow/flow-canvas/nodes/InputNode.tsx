import IconButton from "@mui/joy/IconButton";
import { useContext, useMemo } from "react";
import { Position, useNodeId, useUpdateNodeInternals } from "reactflow";
import { NodeID, NodeType } from "../../../../models/flow-content-types";
import {
  V3InputNodeConfig,
  VariableConfigType,
} from "../../../../models/v3-flow-content-types";
import FlowContext from "../../FlowContext";
import { useFlowStore } from "../../store/store-flow";
import { selectVariables } from "../../store/store-utils";
import {
  DetailPanelContentType,
  FlowState,
} from "../../store/types-local-state";
import AddVariableButton from "./node-common/AddVariableButton";
import HeaderSection from "./node-common/HeaderSection";
import {
  OutputHandle,
  Section,
  SmallSection,
  StyledIconGear,
} from "./node-common/node-common";
import NodeBox from "./node-common/NodeBox";
import NodeOutputModifyRow from "./node-common/NodeOutputModifyRow";
import { calculateOutputHandleBottom } from "./node-common/utils";

const selector = (state: FlowState) => ({
  setDetailPanelContentType: state.setDetailPanelContentType,
  nodeConfigs: state.nodeConfigs,
  variableConfigs: state.variableConfigs,
  addVariable: state.addVariable,
  updateVariable: state.updateVariable,
  removeVariable: state.removeVariable,
  removeNode: state.removeNode,
});

export default function InputNode() {
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

  const flowInputs = useMemo(() => {
    return selectVariables(
      nodeId,
      VariableConfigType.FlowInput,
      variableConfigs,
    );
  }, [nodeId, variableConfigs]);

  const nodeConfig = useMemo(
    () => nodeConfigs[nodeId] as V3InputNodeConfig | undefined,
    [nodeConfigs, nodeId],
  );

  const updateNodeInternals = useUpdateNodeInternals();

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
                  VariableConfigType.FlowInput,
                  flowInputs.length,
                );
                updateNodeInternals(nodeId);
              }}
            />
          )}
        </SmallSection>
        <Section>
          {flowInputs.map((flowInput, i) => (
            <NodeOutputModifyRow
              key={flowInput.id}
              name={flowInput.name}
              isReadOnly={!isCurrentUserOwner}
              onConfirmNameChange={(name) => {
                updateVariable(flowInput.id, { name });
              }}
              onRemove={() => {
                removeVariable(flowInput.id);
                updateNodeInternals(nodeId);
              }}
            />
          ))}
        </Section>
      </NodeBox>
      {flowInputs.map((flowInput, i) => (
        <OutputHandle
          key={flowInput.id}
          type="source"
          id={flowInput.id}
          position={Position.Right}
          style={{
            bottom: calculateOutputHandleBottom(flowInputs.length - 1 - i),
          }}
        />
      ))}
    </>
  );
}
