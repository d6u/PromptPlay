import styled from '@emotion/styled';
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

import NodeAddConnectorButton from 'components/NodeAddConnectorButton';
import NodeConditionDefaultItem from 'components/node-connector/NodeConditionDefaultItem';
import NodeConditionsEditableList from 'components/node-connector/NodeConditionsEditableList';
import NodeVariablesEditableList from 'components/node-connector/NodeVariablesEditableList';
import HeaderSection from 'components/side-pane/SidePaneHeaderSection';
import HeaderSectionHeader from 'components/side-pane/SidePaneHeaderSectionHeader';
import { useFlowStore } from 'state-flow/flow-store';
import { selectConditions } from 'state-flow/util/state-utils';

import NodeConfigPaneContainer from '../node-config-pane-base-ui/NodeConfigPaneContainer';

type Props = {
  nodeId: string;
  isNodeReadOnly: boolean;
  nodeConfig: ConditionNodeInstanceLevelConfig;
  inputVariables: NodeInputVariable[];
};

function ConditionNodeConfigPane(props: Props) {
  const updateNodeInternals = useUpdateNodeInternals();

  const connectors = useFlowStore((s) => s.getFlowContent().variablesDict);
  const connectorResults = useFlowStore((s) =>
    s.getDefaultVariableValueLookUpDict(),
  );
  const updateNodeConfig = useFlowStore((s) => s.updateNodeConfig);
  const addVariable = useFlowStore((s) => s.addVariable);

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
      <HeaderSection>
        <HeaderSectionHeader>{nodeDefinition.label} Config</HeaderSectionHeader>
      </HeaderSection>
      <NodeVariablesEditableList
        nodeId={props.nodeId}
        isNodeReadOnly={props.isNodeReadOnly}
        variableConfigs={props.inputVariables.map((variable) => {
          return { id: variable.id, name: variable.name, isReadOnly: true };
        })}
      />
      <Section>
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
      </Section>
      <Section>
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
      </Section>
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

const Section = styled.div`
  margin-top: 10px;
  margin-top: 10px;
`;

export default ConditionNodeConfigPane;
