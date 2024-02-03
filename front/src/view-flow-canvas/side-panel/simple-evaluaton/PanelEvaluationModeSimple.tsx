import styled from '@emotion/styled';
import { Button } from '@mui/joy';
import { ConnectorType, VariableValueType } from 'flow-models';
import { useContext, useMemo } from 'react';
import RouteFlowContext from 'state-flow/context/FlowRouteContext';
import { useFlowStore } from 'state-flow/context/FlowStoreContext';
import { selectAllVariables } from 'state-flow/state-utils';
import InputBlock from '../common/InputBlock';
import OutputRenderer from '../common/OutputRenderer';
import {
  HeaderSection,
  HeaderSectionHeader,
  Section,
} from '../common/controls-common';

export default function PanelEvaluationModeSimple() {
  const { isCurrentUserOwner } = useContext(RouteFlowContext);

  // SECTION: Select state from store

  const isRunning = useFlowStore((s) => s.isRunning);
  const variableMap = useFlowStore((s) => s.variablesDict);
  const runFlow = useFlowStore((s) => s.runFlow);
  const stopRunningFlow = useFlowStore((s) => s.stopRunningFlow);
  const defaultVariableValueMap = useFlowStore((s) =>
    s.getDefaultVariableValueLookUpDict(),
  );
  const updateVariableValueMap = useFlowStore((s) => s.updateVariableValueMap);
  const updateVariable = useFlowStore((s) => s.updateVariable);

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
            color={isRunning ? 'danger' : 'success'}
            onClick={isRunning ? stopRunningFlow : runFlow}
          >
            {isRunning ? 'Stop' : 'Run'}
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
            value={defaultVariableValueMap[variable.id]}
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
          <OutputRenderer key={output.id} outputItem={output} />
        ))}
      </Section>
    </Container>
  );
}

const Container = styled.div`
  width: 50vw;
  max-width: 600px;
  padding: 20px;
`;
