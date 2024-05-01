import { useMemo } from 'react';
import { useUpdateNodeInternals } from 'reactflow';

import {
  ConnectorType,
  InputNodeInstanceLevelConfig,
  getNodeDefinitionForNodeTypeName,
  type GenericChatbotStartNodeInstanceLevelConfig,
  type LoopStartNodeInstanceLevelConfig,
} from 'flow-models';

import NodeRenamableVariableList from 'components/node-connector/variable/NodeRenamableVariableList';
import SidePaneHeaderSection from 'components/side-pane/SidePaneHeaderSection';
import HeaderSectionHeader from 'components/side-pane/SidePaneHeaderSectionHeader';
import { useFlowStore } from 'state-flow/flow-store';
import { selectVariables } from 'state-flow/util/state-utils';

import NodeConfigPaneAddConnectorButton from '../left-side-pane-base-ui/NodeConfigPaneAddConnectorButton';
import NodeConfigPaneContainer from '../left-side-pane-base-ui/NodeConfigPaneContainer';

type Props = {
  nodeId: string;
  isNodeReadOnly: boolean;
  nodeConfig:
    | InputNodeInstanceLevelConfig
    | LoopStartNodeInstanceLevelConfig
    | GenericChatbotStartNodeInstanceLevelConfig;
};

function StartClassNodeConfigPane(props: Props) {
  const updateNodeInternals = useUpdateNodeInternals();

  const nodeDefinition = useMemo(
    () => getNodeDefinitionForNodeTypeName(props.nodeConfig.type),
    [props.nodeConfig.type],
  );

  const connectors = useFlowStore((s) => s.getFlowContent().connectors);
  const addVariable = useFlowStore((s) => s.addConnector);

  const flowInputVariables = useMemo(() => {
    return selectVariables(
      props.nodeConfig,
      ConnectorType.NodeOutput,
      connectors,
    );
  }, [props.nodeConfig, connectors]);

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
      />
    </NodeConfigPaneContainer>
  );
}

export default StartClassNodeConfigPane;
