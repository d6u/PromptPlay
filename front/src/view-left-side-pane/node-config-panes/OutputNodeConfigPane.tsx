import styled from '@emotion/styled';
import { useMemo } from 'react';
import { useUpdateNodeInternals } from 'reactflow';

import {
  ConnectorType,
  OutputNodeAllLevelConfig,
  getNodeDefinitionForNodeTypeName,
} from 'flow-models';

import NodeVariablesEditableList from 'components/node-connector/NodeVariablesEditableList';
import HeaderSection from 'components/side-pane/SidePaneHeaderSection';
import HeaderSectionHeader from 'components/side-pane/SidePaneHeaderSectionHeader';
import { useFlowStore } from 'state-flow/flow-store';
import { selectVariables } from 'state-flow/util/state-utils';
import NodeBoxAddConnectorButton from 'view-flow-canvas/node-box/NodeBoxAddConnectorButton';

type Props = {
  nodeId: string;
  isReadOnly: boolean;
  nodeConfig: OutputNodeAllLevelConfig;
};

function OutputNodeConfigPane(props: Props) {
  const updateNodeInternals = useUpdateNodeInternals();

  const nodeDefinition = useMemo(
    () => getNodeDefinitionForNodeTypeName(props.nodeConfig.type),
    [props.nodeConfig.type],
  );

  const variables = useFlowStore((s) => s.getFlowContent().variablesDict);
  const addVariable = useFlowStore((s) => s.addVariable);

  const flowOutputVariables = useMemo(() => {
    return selectVariables(props.nodeId, ConnectorType.FlowOutput, variables);
  }, [props.nodeId, variables]);

  return (
    <Container>
      <HeaderSection>
        <HeaderSectionHeader>{nodeDefinition.label} Config</HeaderSectionHeader>
      </HeaderSection>
      <AddConnectorButtonSection>
        <NodeBoxAddConnectorButton
          label="Variable"
          onClick={() => {
            addVariable(
              props.nodeConfig.nodeId,
              ConnectorType.FlowOutput,
              flowOutputVariables.length,
            );
            updateNodeInternals(props.nodeConfig.nodeId);
          }}
        />
      </AddConnectorButtonSection>
      <NodeVariablesEditableList
        isListSortable
        nodeId={props.nodeConfig.nodeId}
        isNodeReadOnly={false}
        variableConfigs={flowOutputVariables.map((variable) => ({
          id: variable.id,
          name: variable.name,
          isReadOnly: false,
        }))}
      />
    </Container>
  );
}

const Container = styled.div`
  padding: 15px 15px 0 15px;
`;

const AddConnectorButtonSection = styled.div`
  margin-top: 10px;
  margin-bottom: 10px;
`;

export default OutputNodeConfigPane;
