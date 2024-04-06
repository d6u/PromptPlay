import styled from '@emotion/styled';
import { Button } from '@mui/joy';
import { useContext, useMemo } from 'react';

import {
  ConnectorType,
  type NodeConfig,
  type NodeOutputVariable,
  type VariableValueRecords,
} from 'flow-models';

import SidePaneHeaderSection from 'components/side-pane/SidePaneHeaderSection';
import HeaderSectionHeader from 'components/side-pane/SidePaneHeaderSectionHeader';
import SidePaneOutputRenderer from 'components/side-pane/SidePaneOutputRenderer';
import SidePaneSection from 'components/side-pane/SidePaneSection';
import RouteFlowContext from 'state-flow/context/FlowRouteContext';
import { useFlowStore } from 'state-flow/flow-store';
import { selectVariablesOnAllEndNodes } from 'state-flow/util/state-utils';
import InputBlock from 'view-right-side-pane/common/InputBlock';

type Props = {
  nodeConfig: NodeConfig;
};

function GenericInputOutputTest(props: Props) {
  const { isCurrentUserOwner } = useContext(RouteFlowContext);

  const nodeConfigs = useFlowStore((s) => s.getFlowContent().nodeConfigs);
  const connectors = useFlowStore((s) => s.getFlowContent().connectors);

  const flowInputVariables = useMemo(() => {
    return Object.values(connectors).filter(
      (connector): connector is NodeOutputVariable => {
        return (
          connector.nodeId === props.nodeConfig.nodeId &&
          connector.type === ConnectorType.NodeOutput
        );
      },
    );
  }, [props.nodeConfig.nodeId, connectors]);

  const variableResults = useFlowStore(
    (s) => s.getFlowContent().variableResults,
  );

  const isExecutingFlowSingleRun = useFlowStore(
    (s) => s.canvasStateMachine.getSnapshot().context.isExecutingFlowSingleRun,
  );
  const runFlow = useFlowStore((s) => s.startFlowSingleRun);
  const stopRunningFlow = useFlowStore((s) => s.stopFlowSingleRun);
  const updateVariableValues = useFlowStore((s) => s.updateVariableValues);

  const flowOutputs = useMemo(() => {
    return selectVariablesOnAllEndNodes(connectors, nodeConfigs);
  }, [nodeConfigs, connectors]);

  return (
    <Conatiner>
      <SidePaneHeaderSection>
        <HeaderSectionHeader>Input variables</HeaderSectionHeader>
        {isCurrentUserOwner && (
          <Button
            color={isExecutingFlowSingleRun ? 'danger' : 'success'}
            onClick={() => {
              if (isExecutingFlowSingleRun) {
                stopRunningFlow();
              }

              const inputValues: VariableValueRecords = {};

              flowInputVariables.forEach((variable) => {
                inputValues[variable.id] = variableResults[variable.id];
              });

              runFlow({ inputValues });
            }}
          >
            {isExecutingFlowSingleRun ? 'Stop' : 'Run'}
          </Button>
        )}
      </SidePaneHeaderSection>
      <SidePaneSection>
        {flowInputVariables.map((variable) => {
          return (
            <InputBlock
              key={variable.id}
              isReadOnly={!isCurrentUserOwner}
              id={variable.id}
              name={variable.name}
              value={variableResults[variable.id]?.value as string}
              onSaveValue={(value) => {
                updateVariableValues([
                  { variableId: variable.id, update: { value } },
                ]);
              }}
            />
          );
        })}
      </SidePaneSection>
      <SidePaneHeaderSection>
        <HeaderSectionHeader>Output values</HeaderSectionHeader>
      </SidePaneHeaderSection>
      <SidePaneSection>
        {flowOutputs.map((output) => (
          <SidePaneOutputRenderer key={output.id} outputItem={output} />
        ))}
      </SidePaneSection>
    </Conatiner>
  );
}

const Conatiner = styled.div`
  padding-left: 10px;
  padding-right: 10px;
  height: 100%;
  overflow-y: auto;
`;

export default GenericInputOutputTest;
