import styled from '@emotion/styled';
import { Button } from '@mui/joy';
import { ConnectorType, VariableValueType } from 'flow-models';
import { useContext, useMemo } from 'react';
import RouteFlowContext from 'route-flow/common/RouteFlowContext';
import { useStoreFromFlowStoreContext } from 'route-flow/store/FlowStoreContext';
import { selectAllVariables } from 'route-flow/store/state-utils';
import { useStore } from 'zustand';
import InputBlock from '../common/InputBlock';
import OutputRenderer from '../common/OutputRenderer';
import {
  HeaderSection,
  HeaderSectionHeader,
  Section,
} from '../common/controls-common';

export default function PanelEvaluationModeSimple() {
  const { isCurrentUserOwner } = useContext(RouteFlowContext);
  const flowStore = useStoreFromFlowStoreContext();

  // SECTION: Select state from store

  const isRunning = useStore(flowStore, (s) => s.isRunning);
  const variableMap = useStore(flowStore, (s) => s.variablesDict);
  const runFlow = useStore(flowStore, (s) => s.runFlow);
  const stopRunningFlow = useStore(flowStore, (s) => s.stopRunningFlow);
  const defaultVariableValueMap = useStore(flowStore, (s) =>
    s.getDefaultVariableValueLookUpDict(),
  );
  const updateVariableValueMap = useStore(
    flowStore,
    (s) => s.updateVariableValueMap,
  );
  const updateVariable = useStore(flowStore, (s) => s.updateVariable);

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
