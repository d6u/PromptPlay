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

import NodeConfigPaneAddConnectorButton from '../node-config-pane-base-ui/NodeConfigPaneAddConnectorButton';
import NodeConfigPaneContainer from '../node-config-pane-base-ui/NodeConfigPaneContainer';

type Props = {
  nodeId: string;
  isNodeReadOnly: boolean;
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
    <NodeConfigPaneContainer>
      <HeaderSection>
        <HeaderSectionHeader>{nodeDefinition.label} Config</HeaderSectionHeader>
      </HeaderSection>
      <NodeConfigPaneAddConnectorButton
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
    </NodeConfigPaneContainer>
  );
}

export default OutputNodeConfigPane;
