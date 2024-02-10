import styled from '@emotion/styled';
import { Checkbox, FormControl, FormHelperText, FormLabel } from '@mui/joy';
import { useMemo } from 'react';
import { useUpdateNodeInternals } from 'reactflow';

import {
  ConditionNodeInstanceLevelConfig,
  ConditionResult,
  ConnectorType,
  getNodeDefinitionForNodeTypeName,
} from 'flow-models';

import NodeBoxVariablesEditableList from 'components/node-variables-editable-list/NodeBoxVariablesEditableList';
import { VariableConfig } from 'components/node-variables-editable-list/types';
import HeaderSection from 'components/side-pane/SidePaneHeaderSection';
import HeaderSectionHeader from 'components/side-pane/SidePaneHeaderSectionHeader';
import { useFlowStore } from 'state-flow/context/FlowStoreContext';
import { selectConditions } from 'state-flow/util/state-utils';
import NodeBoxAddConnectorButton from 'view-flow-canvas/node-box/NodeBoxAddConnectorButton';
import NodeBoxOutgoingConnectorBlock from 'view-flow-canvas/node-box/NodeBoxOutgoingConnectorBlock';
import NodeBoxOutgoingVariableBlock from 'view-flow-canvas/node-box/NodeBoxOutgoingVariableBlock';

type Props = {
  isReadOnly: boolean;
  nodeConfig: ConditionNodeInstanceLevelConfig;
  incomingVariables: VariableConfig[];
};

function ConditionNodeConfigPanel(props: Props) {
  const updateNodeInternals = useUpdateNodeInternals();

  const connectorMap = useFlowStore((s) => s.variablesDict);
  const connectorResultMap = useFlowStore((s) =>
    s.getDefaultVariableValueLookUpDict(),
  );
  const updateNodeConfig = useFlowStore((s) => s.updateNodeConfig);
  const addVariable = useFlowStore((s) => s.addVariable);
  const updateVariable = useFlowStore((s) => s.updateVariable);
  const removeVariable = useFlowStore((s) => s.removeVariable);

  const nodeDefinition = useMemo(() => {
    return getNodeDefinitionForNodeTypeName(props.nodeConfig.type);
  }, [props.nodeConfig.type]);

  const conditions = useMemo(() => {
    return selectConditions(props.nodeConfig.nodeId, connectorMap);
  }, [props.nodeConfig.nodeId, connectorMap]);

  const defaultCaseCondition = useMemo(() => conditions[0], [conditions]);
  const normalConditions = useMemo(() => conditions.slice(1), [conditions]);

  return (
    <>
      <HeaderSection>
        <HeaderSectionHeader>{nodeDefinition.label} Config</HeaderSectionHeader>
      </HeaderSection>
      <NodeBoxVariablesEditableList
        variables={props.incomingVariables.map((variable) => {
          return {
            ...variable,
            isReadOnly: true,
          };
        })}
        isSortable
      />
      <FormControl>
        <FormLabel>Stop at the first match</FormLabel>
        <Checkbox
          disabled={props.isReadOnly}
          size="sm"
          variant="outlined"
          checked={props.nodeConfig.stopAtTheFirstMatch}
          onChange={(event) => {
            updateNodeConfig(props.nodeConfig.nodeId, {
              stopAtTheFirstMatch: event.target.checked,
            });
          }}
        />
      </FormControl>
      <FormHelperText>
        In either case, the default case will be matched if no condition has
        matched.
      </FormHelperText>
      <Section>
        {!props.isReadOnly && (
          <NodeBoxAddConnectorButton
            label="Condition"
            onClick={() => {
              addVariable(
                props.nodeConfig.nodeId,
                ConnectorType.Condition,
                normalConditions.length,
              );
              updateNodeInternals(props.nodeConfig.nodeId);
            }}
          />
        )}
      </Section>
      {normalConditions.map((condition, i) => (
        <Section key={condition.id}>
          <NodeBoxOutgoingConnectorBlock
            name={condition.expressionString}
            isReadOnly={props.isReadOnly}
            onConfirmNameChange={(expressionString) => {
              updateVariable(condition.id, { expressionString });
            }}
            onRemove={() => {
              removeVariable(condition.id);
              updateNodeInternals(props.nodeConfig.nodeId);
            }}
          />
          <NodeBoxOutgoingVariableBlock
            id={defaultCaseCondition.id}
            name="is matched"
            value={
              (connectorResultMap[condition.id] as ConditionResult | undefined)
                ?.isConditionMatched
            }
            style={{ marginTop: '5px' }}
          />
        </Section>
      ))}
      <Section>
        <NodeBoxOutgoingVariableBlock
          id={defaultCaseCondition.id}
          name="Default case"
        />
        <FormHelperText>
          The default case is matched when no other condition have matched.
        </FormHelperText>
      </Section>
    </>
  );
}

const Section = styled.div`
  margin-top: 10px;
  margin-top: 10px;
`;

export default ConditionNodeConfigPanel;
