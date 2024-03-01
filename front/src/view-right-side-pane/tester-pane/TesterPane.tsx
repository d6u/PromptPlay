import styled from '@emotion/styled';
import { Button } from '@mui/joy';
import { useContext, useMemo } from 'react';

import { ConnectorType, VariableValueType } from 'flow-models';

import HeaderSection from 'components/side-pane/SidePaneHeaderSection';
import HeaderSectionHeader from 'components/side-pane/SidePaneHeaderSectionHeader';
import SidePaneOutputRenderer from 'components/side-pane/SidePaneOutputRenderer';
import Section from 'components/side-pane/SidePaneSection';
import RouteFlowContext from 'state-flow/context/FlowRouteContext';
import { useFlowStore } from 'state-flow/flow-store';
import { selectAllVariables } from 'state-flow/util/state-utils';

import InputBlock from '../common/InputBlock';

function TesterPane() {
  const { isCurrentUserOwner } = useContext(RouteFlowContext);

  // SECTION: Select state from store
  const isExecutingFlowSingleRun = useFlowStore(
    (s) => s.canvasStateMachine.getSnapshot().context.isExecutingFlowSingleRun,
  );
  const variableMap = useFlowStore((s) => s.getFlowContent().variablesDict);
  const runFlow = useFlowStore((s) => s.startFlowSingleRun);
  const stopRunningFlow = useFlowStore((s) => s.stopFlowSingleRun);
  const variableValueMap = useFlowStore((s) =>
    s.getDefaultVariableValueLookUpDict(),
  );
  const updateVariableValueMap = useFlowStore((s) => s.updateVariableValue);
  const updateVariable = useFlowStore((s) => s.updateConnector);
  // !SECTION

  const flowInputs = useMemo(() => {
    return selectAllVariables(ConnectorType.FlowInput, variableMap);
  }, [variableMap]);

  const flowOutputs = useMemo(() => {
    return selectAllVariables(ConnectorType.FlowOutput, variableMap);
  }, [variableMap]);

  return (
    <Container>
      <HeaderSection>
        <HeaderSectionHeader>Input variables</HeaderSectionHeader>
        {isCurrentUserOwner && (
          <Button
            color={isExecutingFlowSingleRun ? 'danger' : 'success'}
            onClick={isExecutingFlowSingleRun ? stopRunningFlow : runFlow}
          >
            {isExecutingFlowSingleRun ? 'Stop' : 'Run'}
          </Button>
        )}
      </HeaderSection>
      <Section>
        {flowInputs.map((variable, i) => (
          <InputBlock
            key={variable.id}
            isReadOnly={!isCurrentUserOwner}
            id={variable.id}
            name={variable.name}
            value={variableValueMap[variable.id]}
            onSaveValue={(value) => {
              updateVariableValueMap(variable.id, value);
            }}
            type={variable.valueType}
            onSaveType={(newType) => {
              if (newType !== variable.valueType) {
                switch (newType) {
                  case VariableValueType.String:
                    updateVariableValueMap(variable.id, '');
                    break;
                  case VariableValueType.Number:
                    updateVariableValueMap(variable.id, 0);
                    break;
                }
              }

              updateVariable(variable.id, { valueType: newType });
            }}
          />
        ))}
      </Section>
      <HeaderSection>
        <HeaderSectionHeader>Output values</HeaderSectionHeader>
      </HeaderSection>
      <Section>
        {flowOutputs.map((output) => (
          <SidePaneOutputRenderer key={output.id} outputItem={output} />
        ))}
      </Section>
    </Container>
  );
}

const Container = styled.div`
  padding: 15px;
`;

export default TesterPane;
