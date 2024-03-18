import styled from '@emotion/styled';
import { Button } from '@mui/joy';
import { useContext, useMemo } from 'react';

import SidePaneHeaderSection from 'components/side-pane/SidePaneHeaderSection';
import HeaderSectionHeader from 'components/side-pane/SidePaneHeaderSectionHeader';
import SidePaneOutputRenderer from 'components/side-pane/SidePaneOutputRenderer';
import SidePaneSection from 'components/side-pane/SidePaneSection';
import RouteFlowContext from 'state-flow/context/FlowRouteContext';
import { useFlowStore } from 'state-flow/flow-store';
import {
  selectVariablesOnAllEndNodes,
  selectVariablesOnAllStartNodes,
} from 'state-flow/util/state-utils';

import InputBlock from '../common/InputBlock';

function TesterPane() {
  const { isCurrentUserOwner } = useContext(RouteFlowContext);

  // SECTION: Select state from store
  const isExecutingFlowSingleRun = useFlowStore(
    (s) => s.canvasStateMachine.getSnapshot().context.isExecutingFlowSingleRun,
  );
  const variableMap = useFlowStore((s) => s.getFlowContent().variablesDict);
  const nodeConfigs = useFlowStore((s) => s.getFlowContent().nodeConfigsDict);

  const runFlow = useFlowStore((s) => s.startFlowSingleRun);
  const stopRunningFlow = useFlowStore((s) => s.stopFlowSingleRun);
  const variableValueMap = useFlowStore((s) =>
    s.getDefaultVariableValueLookUpDict(),
  );
  const updateVariableValueMap = useFlowStore((s) => s.updateVariableValue);
  // !SECTION

  const flowInputs = useMemo(() => {
    return selectVariablesOnAllStartNodes(variableMap, nodeConfigs);
  }, [nodeConfigs, variableMap]);

  const flowOutputs = useMemo(() => {
    return selectVariablesOnAllEndNodes(variableMap, nodeConfigs);
  }, [nodeConfigs, variableMap]);

  return (
    <Container>
      <SidePaneHeaderSection>
        <HeaderSectionHeader>Input variables</HeaderSectionHeader>
        {isCurrentUserOwner && (
          <Button
            color={isExecutingFlowSingleRun ? 'danger' : 'success'}
            onClick={isExecutingFlowSingleRun ? stopRunningFlow : runFlow}
          >
            {isExecutingFlowSingleRun ? 'Stop' : 'Run'}
          </Button>
        )}
      </SidePaneHeaderSection>
      <SidePaneSection>
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
          />
        ))}
      </SidePaneSection>
      <SidePaneHeaderSection>
        <HeaderSectionHeader>Output values</HeaderSectionHeader>
      </SidePaneHeaderSection>
      <SidePaneSection>
        {flowOutputs.map((output) => (
          <SidePaneOutputRenderer key={output.id} outputItem={output} />
        ))}
      </SidePaneSection>
    </Container>
  );
}

const Container = styled.div`
  padding: 15px;
`;

export default TesterPane;
