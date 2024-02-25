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

import NodeConditionsEditableList from 'components/node-variables-editable-list/NodeConditionsEditableList';
import NodeConnectorResultDisplay from 'components/node-variables-editable-list/NodeConnectorResultDisplay';
import NodeVariablesEditableList from 'components/node-variables-editable-list/NodeVariablesEditableList';
import HeaderSection from 'components/side-pane/SidePaneHeaderSection';
import HeaderSectionHeader from 'components/side-pane/SidePaneHeaderSectionHeader';
import { useFlowStore } from 'state-flow/context/FlowStoreContext';
import { selectConditions, selectVariables } from 'state-flow/util/state-utils';
import NodeBoxAddConnectorButton from 'view-flow-canvas/node-box/NodeBoxAddConnectorButton';

type Props = {
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
    return selectVariables(
      props.nodeConfig.nodeId,
      ConnectorType.NodeInput,
      connectorMap,
    );
  }, [connectorMap, props.nodeConfig.nodeId]);

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
      <NodeVariablesEditableList
        nodeId={props.nodeConfig.nodeId}
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
      </Section>
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
      <NodeConditionsEditableList
        nodeId={props.nodeConfig.nodeId}
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
      <NodeConnectorResultDisplay
        label="Default case"
        value={
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
    </>
  );
}

const Section = styled.div`
  margin-top: 10px;
  margin-top: 10px;
`;

export default ConditionNodeConfigPanel;
