import { useMemo } from 'react';
import { useUpdateNodeInternals } from 'reactflow';

import {
  ConnectorType,
  OutputNodeAllLevelConfig,
  getNodeDefinitionForNodeTypeName,
} from 'flow-models';

import NodeRenamableVariableList from 'components/node-connector/variable/NodeRenamableVariableList';
import SidePaneHeaderSection from 'components/side-pane/SidePaneHeaderSection';
import HeaderSectionHeader from 'components/side-pane/SidePaneHeaderSectionHeader';
import { useFlowStore } from 'state-flow/flow-store';
import { selectVariables } from 'state-flow/util/state-utils';

import {
  VariableConfig,
  type VariableDefinition,
} from 'components/node-connector/types';
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
  const addVariable = useFlowStore((s) => s.addConnector);

  const flowOutputVariables = useMemo(() => {
    return selectVariables(props.nodeId, ConnectorType.NodeInput, variables);
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
            ConnectorType.NodeInput,
            flowOutputVariables.length,
          );
          updateNodeInternals(props.nodeConfig.nodeId);
        }}
      />
      <NodeRenamableVariableList
        isListSortable
        nodeId={props.nodeConfig.nodeId}
        isNodeReadOnly={false}
        variableConfigs={flowOutputVariables.map<VariableConfig>(
          (variable) => ({
            id: variable.id,
            name: variable.name,
            isGlobal: false,
            globalVariableId: null,
          }),
        )}
        variableDefinitions={flowOutputVariables.map<VariableDefinition>(
          () => ({ isVariableFixed: false }),
        )}
      />
    </NodeConfigPaneContainer>
  );
}

export default OutputNodeConfigPane;
