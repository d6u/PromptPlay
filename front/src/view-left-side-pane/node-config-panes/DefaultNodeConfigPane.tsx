import styled from '@emotion/styled';
import { useMemo } from 'react';
import { useUpdateNodeInternals } from 'reactflow';

import {
  ConditionNodeInstanceLevelConfig,
  ConnectorType,
  InputNodeInstanceLevelConfig,
  JavaScriptFunctionNodeInstanceLevelConfig,
  NodeConfig,
  NodeInputVariable,
  NodeOutputVariable,
  OutputNodeInstanceLevelConfig,
  getNodeDefinitionForNodeTypeName,
} from 'flow-models';

import NodeVariablesEditableList from 'components/node-connector/NodeVariablesEditableList';
import HeaderSection from 'components/side-pane/SidePaneHeaderSection';
import HeaderSectionHeader from 'components/side-pane/SidePaneHeaderSectionHeader';
import SidePaneOutputRenderer from 'components/side-pane/SidePaneOutputRenderer';
import Section from 'components/side-pane/SidePaneSection';
import { useFlowStore } from 'state-flow/flow-store';
import NodeBoxAddConnectorButton from 'view-flow-canvas/node-box/NodeBoxAddConnectorButton';

import NodeConfigPaneNodeFields from './NodeConfigPaneNodeFields';

type Props = {
  nodeId: string;
  isReadOnly: boolean;
  nodeConfig: Exclude<
    NodeConfig,
    | InputNodeInstanceLevelConfig
    | OutputNodeInstanceLevelConfig
    | ConditionNodeInstanceLevelConfig
    | JavaScriptFunctionNodeInstanceLevelConfig
  >;
  inputVariables: NodeInputVariable[];
  outputVariables: NodeOutputVariable[];
};

function DefaultNodeConfigPane(props: Props) {
  const updateNodeInternals = useUpdateNodeInternals();

  const addVariable = useFlowStore((s) => s.addVariable);

  const nodeDefinition = useMemo(
    () => getNodeDefinitionForNodeTypeName(props.nodeConfig.type),
    [props.nodeConfig.type],
  );

  const inputVariableConfig = useMemo(() => {
    return props.inputVariables.map((variable) => {
      const incomingVariableConfig =
        nodeDefinition.fixedIncomingVariables?.[variable.name];

      return {
        id: variable.id,
        name: variable.name,
        isReadOnly: props.isReadOnly || incomingVariableConfig != null,
        helperText: incomingVariableConfig?.helperMessage,
      };
    });
  }, [
    props.inputVariables,
    props.isReadOnly,
    nodeDefinition.fixedIncomingVariables,
  ]);

  return (
    <Container>
      <HeaderSection>
        <HeaderSectionHeader>Output variables</HeaderSectionHeader>
      </HeaderSection>
      <Section>
        {props.outputVariables.map((output) => (
          <SidePaneOutputRenderer key={output.id} outputItem={output} />
        ))}
      </Section>
      <HeaderSection>
        <HeaderSectionHeader>{nodeDefinition.label} Config</HeaderSectionHeader>
      </HeaderSection>
      {nodeDefinition.canUserAddIncomingVariables && (
        <AddConnectorButtonSection>
          <NodeBoxAddConnectorButton
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
        </AddConnectorButtonSection>
      )}
      <NodeVariablesEditableList
        variableConfigs={inputVariableConfig}
        isListSortable
        nodeId={props.nodeConfig.nodeId}
        isNodeReadOnly={false}
      />
      <NodeConfigPaneNodeFields
        nodeConfig={props.nodeConfig}
        isNodeConfigReadOnly={props.isReadOnly}
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

export default DefaultNodeConfigPane;
