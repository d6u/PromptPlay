import { useMemo } from 'react';
import { useUpdateNodeInternals } from 'reactflow';

import {
  ConnectorType,
  InputNodeInstanceLevelConfig,
  getNodeDefinitionForNodeTypeName,
  type GenericChatbotStartNodeInstanceLevelConfig,
} from 'flow-models';

import {
  VariableConfig,
  type VariableDefinition,
} from 'components/node-connector/types';
import NodeRenamableVariableList from 'components/node-connector/variable/NodeRenamableVariableList';
import SidePaneHeaderSection from 'components/side-pane/SidePaneHeaderSection';
import HeaderSectionHeader from 'components/side-pane/SidePaneHeaderSectionHeader';
import { useFlowStore } from 'state-flow/flow-store';
import { selectVariables } from 'state-flow/util/state-utils';

import NodeConfigPaneAddConnectorButton from '../node-config-pane-base-ui/NodeConfigPaneAddConnectorButton';
import NodeConfigPaneContainer from '../node-config-pane-base-ui/NodeConfigPaneContainer';

type Props = {
  nodeId: string;
  isNodeReadOnly: boolean;
  nodeConfig:
    | InputNodeInstanceLevelConfig
    | GenericChatbotStartNodeInstanceLevelConfig;
};

function StartClassNodeConfigPane(props: Props) {
  const updateNodeInternals = useUpdateNodeInternals();

  const nodeDefinition = useMemo(
    () => getNodeDefinitionForNodeTypeName(props.nodeConfig.type),
    [props.nodeConfig.type],
  );

  const variables = useFlowStore((s) => s.getFlowContent().variablesDict);
  const addVariable = useFlowStore((s) => s.addConnector);

  const flowInputVariables = useMemo(() => {
    return selectVariables(props.nodeId, ConnectorType.NodeOutput, variables);
  }, [props.nodeId, variables]);

  return (
    <NodeConfigPaneContainer>
      <SidePaneHeaderSection>
        <HeaderSectionHeader>{nodeDefinition.label} Config</HeaderSectionHeader>
      </SidePaneHeaderSection>
      {nodeDefinition.canUserAddNodeOutputVariable && (
        <NodeConfigPaneAddConnectorButton
          label="Variable"
          onClick={() => {
            addVariable(
              props.nodeConfig.nodeId,
              ConnectorType.NodeOutput,
              flowInputVariables.length,
            );
            updateNodeInternals(props.nodeConfig.nodeId);
          }}
        />
      )}
      <NodeRenamableVariableList
        isListSortable
        nodeId={props.nodeConfig.nodeId}
        isNodeReadOnly={false}
        variableConfigs={flowInputVariables.map<VariableConfig>((variable) => ({
          id: variable.id,
          name: variable.name,
          isGlobal: variable.isGlobal,
          globalVariableId: variable.globalVariableId,
        }))}
        variableDefinitions={flowInputVariables.map<VariableDefinition>(
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

export default StartClassNodeConfigPane;
