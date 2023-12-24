import { FormHelperText } from '@mui/joy';
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
import NodeBox, { NodeState } from './node-common/NodeBox';
import NodeInputModifyRow from './node-common/NodeInputModifyRow';
import NodeOutputModifyRow from './node-common/NodeOutputModifyRow';
import NodeOutputRow from './node-common/NodeOutputRow';
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
  const nodeMetadataDict = useStore(flowStore, (s) => s.nodeMetadataDict);
  const variablesDict = useStore(flowStore, (s) => s.variablesDict);
  const removeNode = useStore(flowStore, (s) => s.removeNode);
  const addVariable = useStore(flowStore, (s) => s.addVariable);
  const updateVariable = useStore(flowStore, (s) => s.updateVariable);
  const removeVariable = useStore(flowStore, (s) => s.removeVariable);

  // !SECTION

  const nodeConfig = useMemo(() => {
    return nodeConfigsDict[nodeId];
  }, [nodeConfigsDict, nodeId]);

  const augment = useMemo(() => {
    return nodeMetadataDict[nodeId];
  }, [nodeMetadataDict, nodeId]);

  const conditionTarget = useMemo(() => {
    return selectConditionTarget(nodeId, variablesDict);
  }, [nodeId, variablesDict]);

  const nodeInputs = useMemo(() => {
    return selectVariables(nodeId, VariableType.NodeInput, variablesDict);
  }, [nodeId, variablesDict]);

  const conditions = useMemo(() => {
    return selectConditions(nodeId, variablesDict);
  }, [nodeId, variablesDict]);

  const defaultCaseCondition = useMemo(() => conditions[0], [conditions]);
  const normalConditions = useMemo(() => conditions.slice(1), [conditions]);

  if (!nodeConfig) {
    // NOTE: This will happen when the node is removed in store, but not yet
    // reflected in react-flow store.
    return null;
  }

  invariant(nodeConfig.type === NodeType.ConditionNode);
  invariant(conditionTarget != null);

  return (
    <>
      <ConditionTargetHandle controlId={conditionTarget.id} />
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
      <NodeBox
        nodeType={NodeType.InputNode}
        state={
          augment?.isRunning
            ? NodeState.Running
            : augment?.hasError
              ? NodeState.Error
              : NodeState.Idle
        }
      >
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
                addVariable(
                  nodeId,
                  VariableType.Condition,
                  normalConditions.length,
                );
                updateNodeInternals(nodeId);
              }}
            />
          )}
        </SmallSection>
        <Section>
          {normalConditions.map((condition, i) => (
            <NodeOutputModifyRow
              key={condition.id}
              name={condition.expressionString}
              isReadOnly={!isCurrentUserOwner}
              onConfirmNameChange={(expressionString) => {
                updateVariable(condition.id, { expressionString });
              }}
              onRemove={() => {
                removeVariable(condition.id);
                updateNodeInternals(nodeId);
              }}
            />
          ))}
        </Section>
        <Section>
          <NodeOutputRow id={defaultCaseCondition.id} name="Default case" />
          <FormHelperText>
            The default case is matched when no other condition have matched.
          </FormHelperText>
        </Section>
      </NodeBox>
      {normalConditions.map((condition, i) => (
        <ConditionHandle
          key={condition.id}
          type="source"
          id={condition.id}
          position={Position.Right}
          style={{
            bottom:
              calculateOutputHandleBottom(conditions.length - i - 1) +
              40 +
              5 +
              5,
          }}
        />
      ))}
      <ConditionHandle
        key={defaultCaseCondition.id}
        type="source"
        id={defaultCaseCondition.id}
        position={Position.Right}
        style={{
          bottom: calculateOutputHandleBottom(0) + 40 + 5,
        }}
      />
    </>
  );
}
