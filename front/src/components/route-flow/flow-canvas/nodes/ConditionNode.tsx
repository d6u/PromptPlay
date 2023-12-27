import { Checkbox, FormControl, FormHelperText, FormLabel } from '@mui/joy';
import { ConditionResult, ConnectorType, NodeID, NodeType } from 'flow-models';
import { useContext, useMemo } from 'react';
import { Position, useNodeId, useUpdateNodeInternals } from 'reactflow';
import invariant from 'tiny-invariant';
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

  const nodeConfigMap = useStore(flowStore, (s) => s.nodeConfigsDict);
  const nodeMetadataMap = useStore(flowStore, (s) => s.nodeMetadataDict);
  const connectorMap = useStore(flowStore, (s) => s.variablesDict);
  const connectorResultMap = useStore(flowStore, (s) =>
    s.getDefaultVariableValueLookUpDict(),
  );
  const removeNode = useStore(flowStore, (s) => s.removeNode);
  const updateNodeConfig = useStore(flowStore, (s) => s.updateNodeConfig);
  const addVariable = useStore(flowStore, (s) => s.addVariable);
  const updateVariable = useStore(flowStore, (s) => s.updateVariable);
  const removeVariable = useStore(flowStore, (s) => s.removeVariable);

  // !SECTION

  const nodeConfig = useMemo(() => {
    return nodeConfigMap[nodeId];
  }, [nodeConfigMap, nodeId]);

  const augment = useMemo(() => {
    return nodeMetadataMap[nodeId];
  }, [nodeMetadataMap, nodeId]);

  const conditionTarget = useMemo(() => {
    return selectConditionTarget(nodeId, connectorMap);
  }, [nodeId, connectorMap]);

  const nodeInputs = useMemo(() => {
    return selectVariables(nodeId, ConnectorType.NodeInput, connectorMap);
  }, [nodeId, connectorMap]);

  const conditions = useMemo(() => {
    return selectConditions(nodeId, connectorMap);
  }, [nodeId, connectorMap]);

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
        <Section>
          <FormControl>
            <FormLabel>Stop at the first match</FormLabel>
            <Checkbox
              disabled={!isCurrentUserOwner}
              size="sm"
              variant="outlined"
              checked={nodeConfig.stopAtTheFirstMatch}
              onChange={(event) => {
                if (!isCurrentUserOwner) {
                  return;
                }

                updateNodeConfig(nodeId, {
                  stopAtTheFirstMatch: event.target.checked,
                });
              }}
            />
          </FormControl>
          <FormHelperText>
            In either case, the default case will be matched if no condition has
            matched.
          </FormHelperText>
        </Section>
        <SmallSection>
          {isCurrentUserOwner && (
            <AddVariableButton
              label="Condition"
              onClick={() => {
                addVariable(
                  nodeId,
                  ConnectorType.Condition,
                  normalConditions.length,
                );
                updateNodeInternals(nodeId);
              }}
            />
          )}
        </SmallSection>
        {normalConditions.map((condition, i) => (
          <Section key={condition.id}>
            <NodeOutputModifyRow
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
            <NodeOutputRow
              id={defaultCaseCondition.id}
              name="is matched"
              value={
                (
                  connectorResultMap[condition.id] as
                    | ConditionResult
                    | undefined
                )?.isConditionMatched
              }
              style={{ marginTop: '5px' }}
            />
          </Section>
        ))}
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
              calculateOutputHandleBottom((conditions.length - i - 1) * 2) +
              (conditions.length - i - 1) * 5 +
              40 +
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
