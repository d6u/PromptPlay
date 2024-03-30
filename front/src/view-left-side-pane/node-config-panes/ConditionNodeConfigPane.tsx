import styled from '@emotion/styled';
import { Option } from '@mobily/ts-belt';
import { Checkbox, FormControl, FormHelperText, FormLabel } from '@mui/joy';
import { useMemo } from 'react';
import { useUpdateNodeInternals } from 'reactflow';

import {
  ConditionNodeInstanceLevelConfig,
  ConditionResult,
  ConnectorType,
  NodeInputVariable,
  getNodeDefinitionForNodeTypeName,
} from 'flow-models';

import NodeConditionDefaultItem from 'components/node-connector/condition/NodeConditionDefaultItem';
import NodeConditionsEditableList from 'components/node-connector/condition/NodeConditionsEditableList';
import NodeRenamableVariableList from 'components/node-connector/variable/NodeRenamableVariableList';
import NodeExecutionMessageDisplay from 'components/node-execution-state/NodeExecutionMessageDisplay';
import SidePaneHeaderSection from 'components/side-pane/SidePaneHeaderSection';
import HeaderSectionHeader from 'components/side-pane/SidePaneHeaderSectionHeader';
import SidePaneSection from 'components/side-pane/SidePaneSection';
import { NodeExecutionState } from 'state-flow/common-types';
import { useFlowStore } from 'state-flow/flow-store';
import { selectConditions } from 'state-flow/util/state-utils';

import {
  VariableConfig,
  type VariableDefinition,
} from 'components/node-connector/types';
import NodeConfigPaneAddConnectorButton from '../node-config-pane-base-ui/NodeConfigPaneAddConnectorButton';
import NodeConfigPaneContainer from '../node-config-pane-base-ui/NodeConfigPaneContainer';

type Props = {
  nodeId: string;
  isNodeReadOnly: boolean;
  nodeConfig: ConditionNodeInstanceLevelConfig;
  inputVariables: NodeInputVariable[];
  // Node Level but not save to server
  nodeExecutionState: Option<NodeExecutionState>;
};

function ConditionNodeConfigPane(props: Props) {
  const updateNodeInternals = useUpdateNodeInternals();

  const connectors = useFlowStore((s) => s.getFlowContent().variablesDict);
  const connectorResults = useFlowStore((s) =>
    s.getDefaultVariableValueLookUpDict(),
  );
  const updateNodeConfig = useFlowStore((s) => s.updateNodeConfig);
  const addVariable = useFlowStore((s) => s.addConnector);

  const nodeDefinition = useMemo(() => {
    return getNodeDefinitionForNodeTypeName(props.nodeConfig.type);
  }, [props.nodeConfig.type]);

  const conditions = useMemo(() => {
    return selectConditions(props.nodeId, connectors);
  }, [props.nodeId, connectors]);

  const defaultCondition = useMemo(() => conditions[0], [conditions]);
  const customConditions = useMemo(() => conditions.slice(1), [conditions]);

  return (
    <NodeConfigPaneContainer>
      {props.nodeExecutionState != null &&
        props.nodeExecutionState.messages.length !== 0 && (
          <>
            <SidePaneHeaderSection>
              <HeaderSectionHeader>
                Message from Previous Run
              </HeaderSectionHeader>
            </SidePaneHeaderSection>
            <SidePaneSection>
              {props.nodeExecutionState.messages.map((message, index) => (
                <NodeExecutionMessageDisplay key={index} message={message} />
              ))}
            </SidePaneSection>
          </>
        )}
      <SidePaneHeaderSection>
        <HeaderSectionHeader>{nodeDefinition.label} Config</HeaderSectionHeader>
      </SidePaneHeaderSection>
      <NodeRenamableVariableList
        nodeId={props.nodeId}
        isNodeReadOnly={props.isNodeReadOnly}
        variableConfigs={props.inputVariables.map<VariableConfig>(
          (variable) => ({
            id: variable.id,
            name: variable.name,
            isGlobal: variable.isGlobal,
            globalVariableId: variable.globalVariableId,
          }),
        )}
        variableDefinitions={props.inputVariables.map<VariableDefinition>(
          () => ({
            isVariableFixed: true,
          }),
        )}
      />
      <GenericSection>
        <FormControl>
          <FormLabel>Stop at the first match</FormLabel>
          <Checkbox
            disabled={props.isNodeReadOnly}
            size="sm"
            variant="outlined"
            checked={props.nodeConfig.stopAtTheFirstMatch}
            onChange={(event) => {
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
      </GenericSection>
      {!props.isNodeReadOnly && (
        <NodeConfigPaneAddConnectorButton
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
      <NodeConditionsEditableList
        nodeId={props.nodeId}
        isNodeReadOnly={props.isNodeReadOnly}
        isListSortable
        conditionConfigs={customConditions.map((condition) => {
          const isMatched =
            (connectorResults[condition.id] as ConditionResult | undefined)
              ?.isConditionMatched ?? false;

          return {
            ...condition,
            isReadOnly: false,
            isMatched,
          };
        })}
      />
      <NodeConditionDefaultItem
        nodeId={props.nodeId}
        conditionId={defaultCondition.id}
        conditionValue={
          (connectorResults[defaultCondition.id] as ConditionResult | undefined)
            ?.isConditionMatched ?? false
        }
      />
      <FormHelperText>
        The default case is matched when no other condition have matched.
      </FormHelperText>
    </NodeConfigPaneContainer>
  );
}

const GenericSection = styled.div`
  margin-top: 10px;
  margin-top: 10px;
`;

export default ConditionNodeConfigPane;
