import styled from '@emotion/styled';
import { Option } from '@mobily/ts-belt';
import { Checkbox, FormControl, FormHelperText, FormLabel } from '@mui/joy';
import { useMemo } from 'react';
import { useUpdateNodeInternals } from 'reactflow';

import {
  ConnectorType,
  NodeInputVariable,
  getNodeDefinitionForNodeTypeName,
  type JSONataConditionNodeInstanceLevelConfig,
} from 'flow-models';

import NodeConditionDefaultItem from 'components/node-connector/condition/NodeConditionDefaultItem';
import NodeConditionsEditableList from 'components/node-connector/condition/NodeConditionsEditableList';
import NodeRenamableVariableList from 'components/node-connector/variable/NodeRenamableVariableList';
import NodeExecutionMessageDisplay from 'components/node-execution-state/NodeExecutionMessageDisplay';
import SidePaneHeaderSection from 'components/side-pane/SidePaneHeaderSection';
import HeaderSectionHeader from 'components/side-pane/SidePaneHeaderSectionHeader';
import SidePaneSection from 'components/side-pane/SidePaneSection';
import { NodeRunStateData } from 'state-flow/common-types';
import { useFlowStore } from 'state-flow/flow-store';
import { selectOutgoingConditions } from 'state-flow/util/state-utils';

import NodeConfigPaneAddConnectorButton from '../left-side-pane-base-ui/NodeConfigPaneAddConnectorButton';
import NodeConfigPaneContainer from '../left-side-pane-base-ui/NodeConfigPaneContainer';

type Props = {
  nodeId: string;
  isNodeReadOnly: boolean;
  nodeConfig: JSONataConditionNodeInstanceLevelConfig;
  inputVariables: NodeInputVariable[];
  // Node Level but not save to server
  nodeExecutionState: Option<NodeRunStateData>;
};

function JSONataConditionNodeConfigPane(props: Props) {
  const updateNodeInternals = useUpdateNodeInternals();

  const connectors = useFlowStore((s) => s.getFlowContent().connectors);
  const conditionResults = useFlowStore(
    (s) => s.getFlowContent().conditionResults,
  );
  const updateNodeConfig = useFlowStore((s) => s.updateNodeConfig);
  const addVariable = useFlowStore((s) => s.addConnector);

  const nodeDefinition = useMemo(() => {
    return getNodeDefinitionForNodeTypeName(props.nodeConfig.type);
  }, [props.nodeConfig.type]);

  const conditions = useMemo(() => {
    return selectOutgoingConditions(props.nodeId, connectors);
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
      <NodeRenamableVariableList nodeId={props.nodeId} />
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
              ConnectorType.OutCondition,
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
            conditionResults[condition.id]?.isConditionMatched ?? false;

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
          conditionResults[defaultCondition.id]?.isConditionMatched ?? false
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

export default JSONataConditionNodeConfigPane;
