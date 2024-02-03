import { Checkbox, FormControl, FormHelperText, FormLabel } from '@mui/joy';
import { ConditionResult, ConnectorType, NodeID, NodeType } from 'flow-models';
import { useContext, useMemo } from 'react';
import { useNodeId, useUpdateNodeInternals } from 'reactflow';
import RouteFlowContext from 'state-flow/context/FlowRouteContext';
import { useFlowStore } from 'state-flow/context/FlowStoreContext';
import {
  selectConditionTarget,
  selectConditions,
  selectVariables,
} from 'state-flow/state-utils';
import invariant from 'tiny-invariant';
import IncomingConditionHandle from '../handles/IncomingConditionHandle';
import IncomingVariableHandle from '../handles/IncomingVariableHandle';
import OutgoingConditionHandle from '../handles/OutgoingConditionHandle';
import NodeBox from '../node-box/NodeBox';
import NodeBoxAddConnectorButton from '../node-box/NodeBoxAddConnectorButton';
import NodeBoxHeaderSection from '../node-box/NodeBoxHeaderSection';
import NodeBoxIncomingVariableBlock from '../node-box/NodeBoxIncomingVariableBlock';
import NodeBoxIncomingVariableSection from '../node-box/NodeBoxIncomingVariableSection';
import NodeBoxOutgoingConnectorBlock from '../node-box/NodeBoxOutgoingConnectorBlock';
import NodeBoxOutgoingVariableBlock from '../node-box/NodeBoxOutgoingVariableBlock';
import NodeBoxSection from '../node-box/NodeBoxSection';
import NodeBoxSmallSection from '../node-box/NodeBoxSmallSection';

export default function ConditionNode() {
  const nodeId = useNodeId() as NodeID;
  const updateNodeInternals = useUpdateNodeInternals();

  const { isCurrentUserOwner } = useContext(RouteFlowContext);

  // SECTION: Select state from store

  const nodeConfigMap = useFlowStore((s) => s.nodeConfigsDict);
  const nodeMetadataMap = useFlowStore((s) => s.nodeMetadataDict);
  const connectorMap = useFlowStore((s) => s.variablesDict);
  const connectorResultMap = useFlowStore((s) =>
    s.getDefaultVariableValueLookUpDict(),
  );
  const removeNode = useFlowStore((s) => s.removeNode);
  const updateNodeConfig = useFlowStore((s) => s.updateNodeConfig);
  const addVariable = useFlowStore((s) => s.addVariable);
  const updateVariable = useFlowStore((s) => s.updateVariable);
  const removeVariable = useFlowStore((s) => s.removeVariable);

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
      <IncomingConditionHandle id={conditionTarget.id} />
      {nodeInputs.map((flowInput, i) => (
        <IncomingVariableHandle key={flowInput.id} id={flowInput.id} />
      ))}
      <NodeBox
        nodeType={NodeType.InputNode}
        isRunning={augment?.isRunning}
        hasError={augment?.hasError}
      >
        <NodeBoxHeaderSection
          isReadOnly={isCurrentUserOwner}
          title="Condition"
          onClickRemove={() => {
            removeNode(nodeId);
          }}
        />
        <NodeBoxIncomingVariableSection>
          {nodeInputs.map((flowInput, i) => (
            <NodeBoxIncomingVariableBlock
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
        </NodeBoxIncomingVariableSection>
        <NodeBoxSection>
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
        </NodeBoxSection>
        <NodeBoxSmallSection>
          {isCurrentUserOwner && (
            <NodeBoxAddConnectorButton
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
        </NodeBoxSmallSection>
        {normalConditions.map((condition, i) => (
          <NodeBoxSection key={condition.id}>
            <NodeBoxOutgoingConnectorBlock
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
            <NodeBoxOutgoingVariableBlock
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
          </NodeBoxSection>
        ))}
        <NodeBoxSection>
          <NodeBoxOutgoingVariableBlock
            id={defaultCaseCondition.id}
            name="Default case"
          />
          <FormHelperText>
            The default case is matched when no other condition have matched.
          </FormHelperText>
        </NodeBoxSection>
      </NodeBox>
      {normalConditions.map((condition, i) => (
        <OutgoingConditionHandle
          key={condition.id}
          id={condition.id}
          index={i}
          totalConditionCount={conditions.length}
        />
      ))}
      <OutgoingConditionHandle
        key={defaultCaseCondition.id}
        id={defaultCaseCondition.id}
        isDefaultCase
      />
    </>
  );
}
