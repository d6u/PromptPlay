import { NodeID, NodeType, VariableType } from 'flow-models';
import { useContext, useMemo } from 'react';
import { Position, useNodeId, useUpdateNodeInternals } from 'reactflow';
import invariant from 'ts-invariant';
import { useStore } from 'zustand';
import FlowContext from '../../FlowContext';
import { useStoreFromFlowStoreContext } from '../../store/FlowStoreContext';
import {
  selectConditionTarget,
  selectConditions,
  selectVariables,
} from '../../store/state-utils';
import AddVariableButton from './node-common/AddVariableButton';
import HeaderSection from './node-common/HeaderSection';
import NodeBox from './node-common/NodeBox';
import NodeInputModifyRow from './node-common/NodeInputModifyRow';
import NodeOutputModifyRow from './node-common/NodeOutputModifyRow';
import {
  ConditionHandle,
  ConditionTargetHandle,
  InputHandle,
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

  const conditions = useMemo(() => {
    return selectConditions(nodeId, variablesDict);
  }, [nodeId, variablesDict]);

  const conditionTarget = useMemo(() => {
    return selectConditionTarget(nodeId, variablesDict);
  }, [nodeId, variablesDict]);

  if (!nodeConfig) {
    // NOTE: This will happen when the node is removed in store, but not yet
    // reflected in react-flow store.
    return null;
  }

  invariant(nodeConfig.type === NodeType.ConditionNode);
  invariant(conditionTarget != null);

  return (
    <>
      <ConditionTargetHandle controlId={conditionTarget.id} isVisible={true} />
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
              label="Condition"
              onClick={() => {
                addVariable(nodeId, VariableType.Condition, conditions.length);
                updateNodeInternals(nodeId);
              }}
            />
          )}
        </SmallSection>
        <Section>
          {conditions.map((condition, i) => (
            <NodeOutputModifyRow
              key={condition.id}
              name={condition.eq}
              isReadOnly={!isCurrentUserOwner}
              onConfirmNameChange={(eq) => {
                updateVariable(condition.id, { eq });
              }}
              onRemove={() => {
                // removeVariable(condition.id);
                updateNodeInternals(nodeId);
              }}
            />
          ))}
        </Section>
      </NodeBox>
      {conditions.map((condition, i) => (
        <ConditionHandle
          key={condition.id}
          type="source"
          id={condition.id}
          position={Position.Right}
          style={{
            bottom: calculateOutputHandleBottom(conditions.length - 1 - i),
          }}
        />
      ))}
    </>
  );
}
