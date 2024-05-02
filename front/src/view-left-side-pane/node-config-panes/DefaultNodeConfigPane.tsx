import { Option } from '@mobily/ts-belt';
import { useMemo } from 'react';
import { useUpdateNodeInternals } from 'reactflow';

import {
  ConnectorType,
  InputNodeInstanceLevelConfig,
  JavaScriptFunctionNodeInstanceLevelConfig,
  NodeConfig,
  NodeInputVariable,
  NodeOutputVariable,
  OutputNodeInstanceLevelConfig,
  getNodeDefinitionForNodeTypeName,
  type JSONataConditionNodeInstanceLevelConfig,
} from 'flow-models';

import NodeRenamableVariableList from 'components/node-connector/variable/NodeRenamableVariableList';
import NodeExecutionMessageDisplay from 'components/node-execution-state/NodeExecutionMessageDisplay';
import SidePaneHeaderSection from 'components/side-pane/SidePaneHeaderSection';
import HeaderSectionHeader from 'components/side-pane/SidePaneHeaderSectionHeader';
import SidePaneOutputRenderer from 'components/side-pane/SidePaneOutputRenderer';
import SidePaneSection from 'components/side-pane/SidePaneSection';
import { NodeRunStateData } from 'state-flow/common-types';
import { useFlowStore } from 'state-flow/flow-store';

import { VariableConfig } from 'components/node-connector/types';
import NodeConfigPaneAddConnectorButton from '../left-side-pane-base-ui/NodeConfigPaneAddConnectorButton';
import NodeConfigPaneContainer from '../left-side-pane-base-ui/NodeConfigPaneContainer';
import NodeConfigPaneNodeFields from '../left-side-pane-base-ui/NodeConfigPaneNodeFields';

type Props = {
  nodeId: string;
  isNodeReadOnly: boolean;
  nodeConfig: Exclude<
    NodeConfig,
    | InputNodeInstanceLevelConfig
    | OutputNodeInstanceLevelConfig
    | JSONataConditionNodeInstanceLevelConfig
    | JavaScriptFunctionNodeInstanceLevelConfig
  >;
  inputVariables: NodeInputVariable[];
  outputVariables: NodeOutputVariable[];
  // Node Level but not save to server
  nodeExecutionState: Option<NodeRunStateData>;
};

function DefaultNodeConfigPane(props: Props) {
  const updateNodeInternals = useUpdateNodeInternals();

  const addVariable = useFlowStore((s) => s.addConnector);

  const nodeDefinition = useMemo(
    () => getNodeDefinitionForNodeTypeName(props.nodeConfig.type),
    [props.nodeConfig.type],
  );

  const inputVariableConfig = useMemo(() => {
    return props.inputVariables.map<VariableConfig>((variable) => {
      return {
        id: variable.id,
        name: variable.name,
        isGlobal: variable.isGlobal,
        globalVariableId: variable.globalVariableId,
      };
    });
  }, [props.inputVariables]);

  return (
    <NodeConfigPaneContainer>
      <SidePaneHeaderSection>
        <HeaderSectionHeader>Output variables</HeaderSectionHeader>
      </SidePaneHeaderSection>
      <SidePaneSection>
        {props.outputVariables.map((output) => (
          <SidePaneOutputRenderer key={output.id} outputItem={output} />
        ))}
      </SidePaneSection>
      {props.nodeExecutionState != null &&
        props.nodeExecutionState.messages.length !== 0 && (
          <>
            <SidePaneHeaderSection>
              <HeaderSectionHeader>
                Message from Previous Run
              </HeaderSectionHeader>
            </SidePaneHeaderSection>
            <SidePaneSection>
              {props.nodeExecutionState.messages.map((message, index) => (
                <NodeExecutionMessageDisplay key={index} message={message} />
              ))}
            </SidePaneSection>
          </>
        )}
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
              inputVariableConfig.length,
            );
            updateNodeInternals(props.nodeConfig.nodeId);
          }}
        />
      )}
      <NodeRenamableVariableList
        isListSortable
        nodeId={props.nodeConfig.nodeId}
      />
      <NodeConfigPaneNodeFields
        nodeConfig={props.nodeConfig}
        isNodeReadOnly={props.isNodeReadOnly}
      />
    </NodeConfigPaneContainer>
  );
}

export default DefaultNodeConfigPane;
