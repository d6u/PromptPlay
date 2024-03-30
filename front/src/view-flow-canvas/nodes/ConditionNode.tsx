import styled from '@emotion/styled';
import { Option } from '@mobily/ts-belt';
import { Checkbox, FormControl, FormHelperText, FormLabel } from '@mui/joy';
import { useMemo } from 'react';
import { Position, useUpdateNodeInternals } from 'reactflow';

import {
  ConditionNodeAllLevelConfig,
  ConditionResult,
  ConditionTarget,
  ConnectorType,
  NodeClass,
  NodeInputVariable,
  NodeType,
} from 'flow-models';

import NodeAddConnectorButton from 'components/NodeAddConnectorButton';
import NodeConditionDefaultItem from 'components/node-connector/condition/NodeConditionDefaultItem';
import NodeConditionsEditableList from 'components/node-connector/condition/NodeConditionsEditableList';
import NodeTargetConditionHandle from 'components/node-connector/condition/NodeTargetConditionHandle';
import NodeRenamableVariableList from 'components/node-connector/variable/NodeRenamableVariableList';
import { useFlowStore } from 'state-flow/flow-store';
import { NodeExecutionState, NodeExecutionStatus } from 'state-flow/types';
import { selectConditions } from 'state-flow/util/state-utils';

import {
  VariableConfig,
  type VariableDefinition,
} from 'components/node-connector/types';
import NodeExecutionMessageDisplay from 'components/node-execution-state/NodeExecutionMessageDisplay';
import NodeBox from '../node-box/NodeBox';
import NodeBoxHeaderSection from '../node-box/NodeBoxHeaderSection';
import NodeBoxSection from '../node-box/NodeBoxSection';
import NodeBoxSmallSection from '../node-box/NodeBoxSmallSection';

type Props = {
  nodeId: string;
  isNodeReadOnly: boolean;
  nodeConfig: ConditionNodeAllLevelConfig;
  inputVariables: NodeInputVariable[];
  conditionTarget: ConditionTarget;
  nodeExecutionState: Option<NodeExecutionState>;
};

function ConditionNode(props: Props) {
  const updateNodeInternals = useUpdateNodeInternals();

  const updateNodeConfig = useFlowStore((s) => s.updateNodeConfig);
  const addVariable = useFlowStore((s) => s.addConnector);

  const connectors = useFlowStore((s) => s.getFlowContent().variablesDict);
  const conditions = useMemo(() => {
    return selectConditions(props.nodeId, connectors);
  }, [props.nodeId, connectors]);
  const defaultCondition = useMemo(() => conditions[0], [conditions]);
  const customConditions = useMemo(() => conditions.slice(1), [conditions]);

  const connectorResults = useFlowStore((s) =>
    s.getDefaultVariableValueLookUpDict(),
  );

  return (
    <>
      <NodeTargetConditionHandle
        nodeId={props.nodeId}
        conditionId={props.conditionTarget.id}
      />
      <NodeBox
        nodeType={NodeType.InputNode}
        isRunning={
          props.nodeExecutionState?.status === NodeExecutionStatus.Executing
        }
        hasError={
          props.nodeExecutionState?.status === NodeExecutionStatus.Error
        }
      >
        <NodeBoxHeaderSection
          nodeClass={NodeClass.Process}
          isNodeReadOnly={props.isNodeReadOnly}
          title="Condition"
          nodeId={props.nodeId}
          showAddVariableButton={false}
        />
        <GenericSection>
          <NodeRenamableVariableList
            showConnectorHandle={Position.Left}
            nodeId={props.nodeId}
            isNodeReadOnly={props.isNodeReadOnly}
            variableConfigs={props.inputVariables.map<VariableConfig>(
              (variable) => {
                return {
                  id: variable.id,
                  name: variable.name,
                  isGlobal: variable.isGlobal,
                  globalVariableId: variable.globalVariableId,
                };
              },
            )}
            variableDefinitions={props.inputVariables.map<VariableDefinition>(
              () => ({ isVariableFixed: true }),
            )}
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
                  ConnectorType.Condition,
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
              const isMatched = (
                connectorResults[condition.id] as ConditionResult | undefined
              )?.isConditionMatched;

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
              (
                connectorResults[defaultCondition.id] as
                  | ConditionResult
                  | undefined
              )?.isConditionMatched
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

export default ConditionNode;
