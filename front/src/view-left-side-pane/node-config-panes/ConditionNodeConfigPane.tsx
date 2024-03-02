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

import NodeConditionDefaultItem from 'components/node-connector/NodeConditionDefaultItem';
import NodeConditionsEditableList from 'components/node-connector/NodeConditionsEditableList';
import NodeVariablesEditableList from 'components/node-connector/NodeVariablesEditableList';
import HeaderSection from 'components/side-pane/SidePaneHeaderSection';
import HeaderSectionHeader from 'components/side-pane/SidePaneHeaderSectionHeader';
import { useFlowStore } from 'state-flow/flow-store';
import { selectConditions, selectVariables } from 'state-flow/util/state-utils';
import NodeBoxAddConnectorButton from 'view-flow-canvas/node-box/NodeBoxAddConnectorButton';

type Props = {
  nodeId: string;
  isReadOnly: boolean;
  nodeConfig: ConditionNodeInstanceLevelConfig;
};

function ConditionNodeConfigPanel(props: Props) {
  const updateNodeInternals = useUpdateNodeInternals();

  const connectorMap = useFlowStore((s) => s.getFlowContent().variablesDict);
  const connectorResultMap = useFlowStore((s) =>
    s.getDefaultVariableValueLookUpDict(),
  );
  const updateNodeConfig = useFlowStore((s) => s.updateNodeConfig);
  const addVariable = useFlowStore((s) => s.addVariable);

  const nodeDefinition = useMemo(() => {
    return getNodeDefinitionForNodeTypeName(props.nodeConfig.type);
  }, [props.nodeConfig.type]);

  const incomingVariables = useMemo(() => {
    return selectVariables(props.nodeId, ConnectorType.NodeInput, connectorMap);
  }, [connectorMap, props.nodeId]);

  const conditions = useMemo(() => {
    return selectConditions(props.nodeId, connectorMap);
  }, [props.nodeId, connectorMap]);

  const defaultCaseCondition = useMemo(() => conditions[0], [conditions]);
  const normalConditions = useMemo(() => conditions.slice(1), [conditions]);

  return (
    <Container>
      <HeaderSection>
        <HeaderSectionHeader>{nodeDefinition.label} Config</HeaderSectionHeader>
      </HeaderSection>
      <NodeVariablesEditableList
        nodeId={props.nodeId}
        isNodeReadOnly={props.isReadOnly}
        variableConfigs={incomingVariables.map((variable) => {
          return { id: variable.id, name: variable.name, isReadOnly: true };
        })}
      />
      <Section>
        <FormControl>
          <FormLabel>Stop at the first match</FormLabel>
          <Checkbox
            disabled={props.isReadOnly}
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
        {!props.isReadOnly && (
          <NodeBoxAddConnectorButton
            label="Condition"
            onClick={() => {
              addVariable(
                props.nodeId,
                ConnectorType.Condition,
                normalConditions.length,
              );
              updateNodeInternals(props.nodeId);
            }}
          />
        )}
      </Section>
      <NodeConditionsEditableList
        nodeId={props.nodeId}
        isNodeReadOnly={props.isReadOnly}
        isListSortable
        conditionConfigs={normalConditions.map((condition) => {
          const isMatched =
            (connectorResultMap[condition.id] as ConditionResult | undefined)
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
        conditionId={defaultCaseCondition.id}
        conditionValue={
          (
            connectorResultMap[defaultCaseCondition.id] as
              | ConditionResult
              | undefined
          )?.isConditionMatched ?? false
        }
      />
      <FormHelperText>
        The default case is matched when no other condition have matched.
      </FormHelperText>
    </Container>
  );
}

const Container = styled.div`
  padding: 15px 15px 0 15px;
`;

const Section = styled.div`
  margin-top: 10px;
  margin-top: 10px;
`;

export default ConditionNodeConfigPanel;
