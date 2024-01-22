import IconButton from '@mui/joy/IconButton';
import {
  ConnectorType,
  NodeID,
  NodeType,
  V3InputNodeConfig,
} from 'flow-models';
import { useContext, useMemo } from 'react';
import { Position, useNodeId, useUpdateNodeInternals } from 'reactflow';
import { useStore } from 'zustand';
import FlowContext from '../../../route-flow/common/FlowContext';
import { useStoreFromFlowStoreContext } from '../../../route-flow/store/FlowStoreContext';
import { selectVariables } from '../../../route-flow/store/state-utils';
import { DetailPanelContentType } from '../../../route-flow/store/store-flow-state-types';
import AddVariableButton from './node-common/AddVariableButton';
import HeaderSection from './node-common/HeaderSection';
import NodeBox from './node-common/NodeBox';
import NodeOutputModifyRow from './node-common/NodeOutputModifyRow';
import {
  OutputHandle,
  Section,
  SmallSection,
  StyledIconGear,
} from './node-common/node-common';
import { calculateOutputHandleBottom } from './node-common/utils';

export default function InputNode() {
  const nodeId = useNodeId() as NodeID;

  const { isCurrentUserOwner } = useContext(FlowContext);
  const flowStore = useStoreFromFlowStoreContext();

  // SECTION: Select state from store

  const setDetailPanelContentType = useStore(
    flowStore,
    (s) => s.setDetailPanelContentType,
  );
  const nodeConfigsDict = useStore(flowStore, (s) => s.nodeConfigsDict);
  const variablesDict = useStore(flowStore, (s) => s.variablesDict);
  const removeNode = useStore(flowStore, (s) => s.removeNode);
  const addVariable = useStore(flowStore, (s) => s.addVariable);
  const updateVariable = useStore(flowStore, (s) => s.updateVariable);
  const removeVariable = useStore(flowStore, (s) => s.removeVariable);

  // !SECTION

  const flowInputs = useMemo(() => {
    return selectVariables(nodeId, ConnectorType.FlowInput, variablesDict);
  }, [nodeId, variablesDict]);

  const nodeConfig = useMemo(
    () => nodeConfigsDict[nodeId] as V3InputNodeConfig | undefined,
    [nodeConfigsDict, nodeId],
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
                addVariable(nodeId, ConnectorType.FlowInput, flowInputs.length);
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
