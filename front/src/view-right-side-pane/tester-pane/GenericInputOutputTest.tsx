import styled from '@emotion/styled';
import { Button } from '@mui/joy';
import {
  ConnectorType,
  type NodeConfig,
  type NodeOutputVariable,
} from 'flow-models';
import { useContext, useMemo } from 'react';

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

  const nodeConfigs = useFlowStore((s) => s.getFlowContent().nodeConfigsDict);
  const connectors = useFlowStore((s) => s.getFlowContent().variablesDict);
  const connectorResults = useFlowStore((s) =>
    s.getDefaultVariableValueLookUpDict(),
  );

  const isExecutingFlowSingleRun = useFlowStore(
    (s) => s.canvasStateMachine.getSnapshot().context.isExecutingFlowSingleRun,
  );
  const runFlow = useFlowStore((s) => s.startFlowSingleRun);
  const stopRunningFlow = useFlowStore((s) => s.stopFlowSingleRun);
  const updateVariableValueMap = useFlowStore((s) => s.updateVariableValue);

  const flowInputs = useMemo(() => {
    return Object.values(connectors).filter(
      (connector): connector is NodeOutputVariable => {
        return (
          connector.nodeId === props.nodeConfig.nodeId &&
          connector.type === ConnectorType.NodeOutput
        );
      },
    );
  }, [props.nodeConfig.nodeId, connectors]);

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
              runFlow({ variableValues: {} });
            }}
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
            value={connectorResults[variable.id]}
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
