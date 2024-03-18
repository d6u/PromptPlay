import { useMemo } from 'react';
import { useUpdateNodeInternals } from 'reactflow';

import {
  ConnectorType,
  InputNodeInstanceLevelConfig,
  getNodeDefinitionForNodeTypeName,
} from 'flow-models';

import NodeRenamableVariableList from 'components/node-connector/variable/NodeRenamableVariableList';
import SidePaneHeaderSection from 'components/side-pane/SidePaneHeaderSection';
import HeaderSectionHeader from 'components/side-pane/SidePaneHeaderSectionHeader';
import { useFlowStore } from 'state-flow/flow-store';
import { selectVariables } from 'state-flow/util/state-utils';

import { VariableConfig } from 'components/node-connector/types';
import NodeConfigPaneAddConnectorButton from '../node-config-pane-base-ui/NodeConfigPaneAddConnectorButton';
import NodeConfigPaneContainer from '../node-config-pane-base-ui/NodeConfigPaneContainer';

type Props = {
  nodeId: string;
  isNodeReadOnly: boolean;
  nodeConfig: InputNodeInstanceLevelConfig;
};

function InputNodeConfigPane(props: Props) {
  const updateNodeInternals = useUpdateNodeInternals();

  const nodeDefinition = useMemo(
    () => getNodeDefinitionForNodeTypeName(props.nodeConfig.type),
    [props.nodeConfig.type],
  );

  const variables = useFlowStore((s) => s.getFlowContent().variablesDict);
  const addVariable = useFlowStore((s) => s.addVariable);

  const flowInputVariables = useMemo(() => {
    return selectVariables(props.nodeId, ConnectorType.FlowInput, variables);
  }, [props.nodeId, variables]);

  return (
    <NodeConfigPaneContainer>
      <SidePaneHeaderSection>
        <HeaderSectionHeader>{nodeDefinition.label} Config</HeaderSectionHeader>
      </SidePaneHeaderSection>
      <NodeConfigPaneAddConnectorButton
        label="Variable"
        onClick={() => {
          addVariable(
            props.nodeConfig.nodeId,
            ConnectorType.FlowInput,
            flowInputVariables.length,
          );
          updateNodeInternals(props.nodeConfig.nodeId);
        }}
      />
      <NodeRenamableVariableList
        isListSortable
        nodeId={props.nodeConfig.nodeId}
        isNodeReadOnly={false}
        variableConfigs={flowInputVariables.map<VariableConfig>((variable) => ({
          id: variable.id,
          name: variable.name,
          isGlobal: false,
          globalVariableId: null,
          isVariableFixed: false,
        }))}
      />
    </NodeConfigPaneContainer>
  );
}

export default InputNodeConfigPane;
