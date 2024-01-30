import { Checkbox, FormControl, FormHelperText, FormLabel } from '@mui/joy';
import { ConditionResult, ConnectorType, NodeID, NodeType } from 'flow-models';
import { useContext, useMemo } from 'react';
import { useNodeId, useUpdateNodeInternals } from 'reactflow';
import invariant from 'tiny-invariant';
import { useStore } from 'zustand';
import IncomingConditionHandle from '../../../common-react-flow/handles/IncomingConditionHandle';
import IncomingVariableHandle from '../../../common-react-flow/handles/IncomingVariableHandle';
import OutgoingConditionHandle from '../../../common-react-flow/handles/OutgoingConditionHandle';
import NodeBox from '../../../common-react-flow/node-box/NodeBox';
import NodeBoxAddConnectorButton from '../../../common-react-flow/node-box/NodeBoxAddConnectorButton';
import NodeBoxHeaderSection from '../../../common-react-flow/node-box/NodeBoxHeaderSection';
import NodeBoxIncomingVariableSection from '../../../common-react-flow/node-box/NodeBoxIncomingVariableSection';
import NodeBoxSection from '../../../common-react-flow/node-box/NodeBoxSection';
import NodeBoxSmallSection from '../../../common-react-flow/node-box/NodeBoxSmallSection';
import RouteFlowContext from '../../../route-flow/common/RouteFlowContext';
import { useStoreFromFlowStoreContext } from '../../../route-flow/store/FlowStoreContext';
import {
  selectConditionTarget,
  selectConditions,
  selectVariables,
} from '../../../route-flow/store/state-utils';
import NodeInputModifyRow from './node-common/NodeInputModifyRow';
import NodeOutputModifyRow from './node-common/NodeOutputModifyRow';
import NodeOutputRow from './node-common/NodeOutputRow';

export default function ConditionNode() {
  const nodeId = useNodeId() as NodeID;
  const updateNodeInternals = useUpdateNodeInternals();

  const { isCurrentUserOwner } = useContext(RouteFlowContext);
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
          </NodeBoxSection>
        ))}
        <NodeBoxSection>
          <NodeOutputRow id={defaultCaseCondition.id} name="Default case" />
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
