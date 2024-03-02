import styled from '@emotion/styled';
import { Checkbox, FormControl, FormHelperText, FormLabel } from '@mui/joy';
import { useContext, useMemo } from 'react';
import { Position, useNodeId, useUpdateNodeInternals } from 'reactflow';
import invariant from 'tiny-invariant';

import { ConditionResult, ConnectorType, NodeType } from 'flow-models';

import NodeConditionsEditableList from 'components/node-connector/NodeConditionsEditableList';
import NodeConnectorResultDisplay from 'components/node-connector/NodeConnectorResultDisplay';
import NodeVariablesEditableList from 'components/node-connector/NodeVariablesEditableList';
import RouteFlowContext from 'state-flow/context/FlowRouteContext';
import { useFlowStore } from 'state-flow/flow-store';
import {
  selectConditionTarget,
  selectConditions,
  selectVariables,
} from 'state-flow/util/state-utils';

import IncomingConditionHandle from '../handles/IncomingConditionHandle';
import OutgoingConditionHandle from '../handles/OutgoingConditionHandle';
import NodeBox from '../node-box/NodeBox';
import NodeBoxAddConnectorButton from '../node-box/NodeBoxAddConnectorButton';
import NodeBoxHeaderSection from '../node-box/NodeBoxHeaderSection';
import NodeBoxSection from '../node-box/NodeBoxSection';
import NodeBoxSmallSection from '../node-box/NodeBoxSmallSection';

function ConditionNode() {
  const nodeId = useNodeId();

  invariant(nodeId != null, 'nodeId is not null');

  const updateNodeInternals = useUpdateNodeInternals();

  const { isCurrentUserOwner } = useContext(RouteFlowContext);

  // SECTION: Select state from store

  const nodeConfigMap = useFlowStore((s) => s.getFlowContent().nodeConfigsDict);
  const nodeMetadataMap = useFlowStore((s) => s.nodeMetadataDict);
  const connectorMap = useFlowStore((s) => s.getFlowContent().variablesDict);
  const connectorResultMap = useFlowStore((s) =>
    s.getDefaultVariableValueLookUpDict(),
  );
  const removeNode = useFlowStore((s) => s.removeNode);
  const updateNodeConfig = useFlowStore((s) => s.updateNodeConfig);
  const addVariable = useFlowStore((s) => s.addVariable);

  // ANCHOR: Left Panel
  const setCanvasLeftPaneIsOpen = useFlowStore(
    (s) => s.setCanvasLeftPaneIsOpen,
  );
  const setCanvasLeftPaneSelectedNodeId = useFlowStore(
    (s) => s.setCanvasLeftPaneSelectedNodeId,
  );

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

  const incomingVariables = useMemo(() => {
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
      <NodeBox
        nodeType={NodeType.InputNode}
        isRunning={augment?.isRunning}
        hasError={augment?.hasError}
      >
        <NodeBoxHeaderSection
          isNodeReadOnly={isCurrentUserOwner}
          title="Condition"
          onClickRemove={() => {
            removeNode(nodeId);
          }}
          onClickGearButton={() => {
            setCanvasLeftPaneIsOpen(true);
            setCanvasLeftPaneSelectedNodeId(nodeId);
          }}
          showAddVariableButton={false}
        />
        <GenericContainer>
          <NodeVariablesEditableList
            showConnectorHandle={Position.Left}
            nodeId={nodeId}
            isNodeReadOnly={!isCurrentUserOwner}
            variableConfigs={incomingVariables.map((variable) => ({
              id: variable.id,
              name: variable.name,
              isReadOnly: true,
            }))}
          />
        </GenericContainer>
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
        <GenericContainer>
          <NodeConditionsEditableList
            nodeId={nodeId}
            isNodeReadOnly={!isCurrentUserOwner}
            showHandles
            conditionConfigs={normalConditions.map((condition) => {
              const isMatched = (
                connectorResultMap[condition.id] as ConditionResult | undefined
              )?.isConditionMatched;

              return {
                ...condition,
                isReadOnly: false,
                isMatched,
              };
            })}
          />
        </GenericContainer>
        <NodeBoxSection>
          <NodeConnectorResultDisplay
            label="Default case"
            value={
              (
                connectorResultMap[defaultCaseCondition.id] as
                  | ConditionResult
                  | undefined
              )?.isConditionMatched
            }
          />
          <FormHelperText>
            The default case is matched when no other condition have matched.
          </FormHelperText>
        </NodeBoxSection>
      </NodeBox>
      <OutgoingConditionHandle
        key={defaultCaseCondition.id}
        id={defaultCaseCondition.id}
        isDefaultCase
      />
    </>
  );
}

const GenericContainer = styled.div`
  padding-left: 10px;
  padding-right: 10px;
`;

export default ConditionNode;
