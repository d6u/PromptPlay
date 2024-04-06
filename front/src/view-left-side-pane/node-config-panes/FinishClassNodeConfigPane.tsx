import { useMemo } from 'react';
import { useUpdateNodeInternals } from 'reactflow';

import {
  ConnectorType,
  OutputNodeAllLevelConfig,
  getNodeDefinitionForNodeTypeName,
  type GenericChatbotFinishNodeAllLevelConfig,
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
  nodeConfig: OutputNodeAllLevelConfig | GenericChatbotFinishNodeAllLevelConfig;
};

function FinishClassNodeConfigPane(props: Props) {
  const updateNodeInternals = useUpdateNodeInternals();

  const connectors = useFlowStore((s) => s.getFlowContent().connectors);
  const addVariable = useFlowStore((s) => s.addConnector);

  const nodeDefinition = useMemo(
    () => getNodeDefinitionForNodeTypeName(props.nodeConfig.type),
    [props.nodeConfig.type],
  );

  const nodeInputVariables = useMemo(() => {
    return selectVariables(props.nodeId, ConnectorType.NodeInput, connectors);
  }, [props.nodeId, connectors]);

  return (
    <NodeConfigPaneContainer>
      <SidePaneHeaderSection>
        <HeaderSectionHeader>{nodeDefinition.label} Config</HeaderSectionHeader>
      </SidePaneHeaderSection>
      {nodeDefinition.canUserAddIncomingVariables && (
        <NodeConfigPaneAddConnectorButton
          label="Variable"
          onClick={() => {
            addVariable(
              props.nodeConfig.nodeId,
              ConnectorType.NodeInput,
              nodeInputVariables.length,
            );
            updateNodeInternals(props.nodeConfig.nodeId);
          }}
        />
      )}
      <NodeRenamableVariableList
        isListSortable
        nodeId={props.nodeConfig.nodeId}
        isNodeReadOnly={false}
        variableConfigs={nodeInputVariables.map<VariableConfig>((v) => ({
          id: v.id,
          name: v.name,
          isGlobal: v.isGlobal,
          globalVariableId: v.globalVariableId,
        }))}
        variableDefinitions={nodeInputVariables.map<VariableDefinition>(
          (variable) => {
            const incomingVariableConfig =
              nodeDefinition.fixedIncomingVariables?.[variable.name];

            return {
              isVariableFixed: incomingVariableConfig != null,
              helperMessage: incomingVariableConfig?.helperMessage,
            };
          },
        )}
      />
    </NodeConfigPaneContainer>
  );
}

export default FinishClassNodeConfigPane;
