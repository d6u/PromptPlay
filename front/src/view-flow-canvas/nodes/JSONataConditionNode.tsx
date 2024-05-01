import styled from '@emotion/styled';
import { Option } from '@mobily/ts-belt';
import { Checkbox, FormControl, FormHelperText, FormLabel } from '@mui/joy';
import { useMemo } from 'react';
import { Position, useUpdateNodeInternals } from 'reactflow';

import {
  ConnectorType,
  IncomingCondition,
  NodeInputVariable,
  NodeKind,
  getNodeDefinitionForNodeTypeName,
  type JSONataConditionNodeAllLevelConfig,
} from 'flow-models';

import NodeAddConnectorButton from 'components/NodeAddConnectorButton';
import NodeConditionDefaultItem from 'components/node-connector/condition/NodeConditionDefaultItem';
import NodeConditionsEditableList from 'components/node-connector/condition/NodeConditionsEditableList';
import NodeIncomingConditionHandle from 'components/node-connector/condition/NodeIncomingConditionHandle';
import NodeRenamableVariableList from 'components/node-connector/variable/NodeRenamableVariableList';
import { NodeRunStateData } from 'state-flow/common-types';
import { useFlowStore } from 'state-flow/flow-store';
import { selectOutgoingConditions } from 'state-flow/util/state-utils';

import NodeExecutionMessageDisplay from 'components/node-execution-state/NodeExecutionMessageDisplay';
import { NodeRunState } from 'run-flow';
import NodeBox from '../node-box/NodeBox';
import NodeBoxHeaderSection from '../node-box/NodeBoxHeaderSection';
import NodeBoxSection from '../node-box/NodeBoxSection';
import NodeBoxSmallSection from '../node-box/NodeBoxSmallSection';

type Props = {
  // reactflow props
  selected: boolean;
  // custom props
  nodeId: string;
  isNodeReadOnly: boolean;
  nodeConfig: JSONataConditionNodeAllLevelConfig;
  inputVariables: NodeInputVariable[];
  incomingCondition: IncomingCondition;
  nodeExecutionState: Option<NodeRunStateData>;
};

function JSONataConditionNode(props: Props) {
  const updateNodeInternals = useUpdateNodeInternals();

  const nodeDefinition = useMemo(() => {
    return getNodeDefinitionForNodeTypeName(props.nodeConfig.type);
  }, [props.nodeConfig.type]);

  const updateNodeConfig = useFlowStore((s) => s.updateNodeConfig);
  const addVariable = useFlowStore((s) => s.addConnector);

  const connectors = useFlowStore((s) => s.getFlowContent().connectors);
  const conditions = useMemo(() => {
    return selectOutgoingConditions(props.nodeId, connectors);
  }, [props.nodeId, connectors]);
  const defaultCondition = useMemo(() => conditions[0], [conditions]);
  const customConditions = useMemo(() => conditions.slice(1), [conditions]);

  const conditionResults = useFlowStore(
    (s) => s.getFlowContent().conditionResults,
  );

  const nodeState = useFlowStore(
    (s) =>
      s.getFlowContent().runFlowStates.nodeStates[props.nodeId] ??
      NodeRunState.PENDING,
  );

  return (
    <>
      <NodeIncomingConditionHandle
        nodeId={props.nodeId}
        conditionId={props.incomingCondition.id}
      />
      <NodeBox selected={props.selected} nodeState={nodeState}>
        <NodeBoxHeaderSection
          nodeKind={NodeKind.Process}
          isNodeReadOnly={props.isNodeReadOnly}
          title={nodeDefinition.label}
          nodeId={props.nodeId}
          showAddVariableButton={false}
        />
        <GenericSection>
          <NodeRenamableVariableList
            showConnectorHandle={Position.Left}
            nodeId={props.nodeId}
            isNodeReadOnly={props.isNodeReadOnly}
          />
        </GenericSection>
        <NodeBoxSection>
          <FormControl>
            <FormLabel>Stop at the first match</FormLabel>
            <Checkbox
              disabled={props.isNodeReadOnly}
              size="sm"
              variant="outlined"
              checked={props.nodeConfig.stopAtTheFirstMatch}
              onChange={(event) => {
                if (props.isNodeReadOnly) {
                  return;
                }

                updateNodeConfig(props.nodeId, {
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
          {!props.isNodeReadOnly && (
            <NodeAddConnectorButton
              label="Condition"
              onClick={() => {
                addVariable(
                  props.nodeId,
                  ConnectorType.OutCondition,
                  customConditions.length,
                );
                updateNodeInternals(props.nodeId);
              }}
            />
          )}
        </NodeBoxSmallSection>
        <GenericSection>
          <NodeConditionsEditableList
            nodeId={props.nodeId}
            isNodeReadOnly={props.isNodeReadOnly}
            showHandles
            conditionConfigs={customConditions.map((condition) => {
              const isMatched =
                conditionResults[condition.id]?.isConditionMatched;

              return {
                ...condition,
                isReadOnly: false,
                isMatched,
              };
            })}
          />
        </GenericSection>
        <NodeBoxSection>
          <NodeConditionDefaultItem
            showHandle
            nodeId={props.nodeId}
            conditionId={defaultCondition.id}
            conditionValue={
              conditionResults[defaultCondition.id]?.isConditionMatched
            }
          />
          <FormHelperText>
            The default case is matched when no other condition have matched.
          </FormHelperText>
        </NodeBoxSection>
        <NodeBoxSection>
          {props.nodeExecutionState?.messages.map((message, index) => (
            <NodeExecutionMessageDisplay key={index} message={message} />
          ))}
        </NodeBoxSection>
      </NodeBox>
    </>
  );
}

const GenericSection = styled.div`
  padding-left: 10px;
  padding-right: 10px;
`;

export default JSONataConditionNode;
