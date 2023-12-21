import { NodeID, NodeType, VariableType } from 'flow-models';
import { useContext, useMemo } from 'react';
import { Position, useNodeId, useUpdateNodeInternals } from 'reactflow';
import invariant from 'ts-invariant';
import { useStore } from 'zustand';
import FlowContext from '../../FlowContext';
import { useStoreFromFlowStoreContext } from '../../store/FlowStoreContext';
import { selectVariables } from '../../store/state-utils';
import AddVariableButton from './node-common/AddVariableButton';
import HeaderSection from './node-common/HeaderSection';
import NodeBox from './node-common/NodeBox';
import NodeInputModifyRow from './node-common/NodeInputModifyRow';
import NodeOutputModifyRow from './node-common/NodeOutputModifyRow';
import {
  InputHandle,
  OutputHandle,
  Section,
  SmallSection,
} from './node-common/node-common';
import {
  calculateInputHandleTop,
  calculateOutputHandleBottom,
} from './node-common/utils';

export default function ConditionNode() {
  const nodeId = useNodeId() as NodeID;
  const updateNodeInternals = useUpdateNodeInternals();

  const { isCurrentUserOwner } = useContext(FlowContext);
  const flowStore = useStoreFromFlowStoreContext();

  // SECTION: Select state from store

  const nodeConfigsDict = useStore(flowStore, (s) => s.nodeConfigsDict);
  const variablesDict = useStore(flowStore, (s) => s.variablesDict);
  const removeNode = useStore(flowStore, (s) => s.removeNode);
  const addVariable = useStore(flowStore, (s) => s.addVariable);
  const updateVariable = useStore(flowStore, (s) => s.updateVariable);
  const removeVariable = useStore(flowStore, (s) => s.removeVariable);

  // !SECTION

  const nodeConfig = useMemo(() => {
    return nodeConfigsDict[nodeId];
  }, [nodeConfigsDict, nodeId]);

  const nodeInputs = useMemo(() => {
    return selectVariables(nodeId, VariableType.NodeInput, variablesDict);
  }, [nodeId, variablesDict]);

  const nodeOutputs = useMemo(() => {
    return selectVariables(nodeId, VariableType.NodeOutput, variablesDict);
  }, [nodeId, variablesDict]);

  if (!nodeConfig) {
    return null;
  }

  invariant(nodeConfig.type === NodeType.ConditionNode);

  return (
    <>
      {nodeInputs.map((flowInput, i) => (
        <InputHandle
          key={flowInput.id}
          type="target"
          id={flowInput.id}
          position={Position.Left}
          style={{
            top: calculateInputHandleTop(nodeInputs.length - 2 - i),
          }}
        />
      ))}
      <NodeBox nodeType={NodeType.InputNode}>
        <HeaderSection
          isCurrentUserOwner={isCurrentUserOwner}
          title="Condition"
          onClickRemove={() => {
            removeNode(nodeId);
          }}
        />
        <Section>
          {nodeInputs.map((flowInput, i) => (
            <NodeInputModifyRow
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
        <SmallSection>
          {isCurrentUserOwner && (
            <AddVariableButton
              onClick={() => {
                addVariable(nodeId, VariableType.FlowInput, nodeOutputs.length);
                updateNodeInternals(nodeId);
              }}
            />
          )}
        </SmallSection>
        <Section>
          {nodeOutputs.map((flowInput, i) => (
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
      {nodeOutputs.map((flowInput, i) => (
        <OutputHandle
          key={flowInput.id}
          type="source"
          id={flowInput.id}
          position={Position.Right}
          style={{
            bottom: calculateOutputHandleBottom(nodeOutputs.length - 1 - i),
          }}
        />
      ))}
    </>
  );
}
