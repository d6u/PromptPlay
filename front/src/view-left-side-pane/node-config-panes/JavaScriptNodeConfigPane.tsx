import styled from '@emotion/styled';
import { FormControl, FormLabel, Textarea } from '@mui/joy';
import { useMemo, useState } from 'react';
import { useUpdateNodeInternals } from 'reactflow';

import {
  ConnectorType,
  JavaScriptFunctionNodeInstanceLevelConfig,
  NodeInputVariable,
  NodeOutputVariable,
  getNodeDefinitionForNodeTypeName,
} from 'flow-models';

import NodeVariablesEditableList from 'components/node-connector/NodeVariablesEditableList';
import NodeFieldLabelWithIconContainer from 'components/node-fields/NodeFieldLabelWithIconContainer';
import HeaderSection from 'components/side-pane/SidePaneHeaderSection';
import HeaderSectionHeader from 'components/side-pane/SidePaneHeaderSectionHeader';
import SidePaneOutputRenderer from 'components/side-pane/SidePaneOutputRenderer';
import Section from 'components/side-pane/SidePaneSection';
import CopyIconButton from 'generic-components/CopyIconButton';
import ReadonlyTextarea from 'generic-components/ReadonlyTextarea';
import { useFlowStore } from 'state-flow/flow-store';
import NodeBoxAddConnectorButton from 'view-flow-canvas/node-box/NodeBoxAddConnectorButton';

type Props = {
  nodeId: string;
  isNodeReadOnly: boolean;
  nodeConfig: JavaScriptFunctionNodeInstanceLevelConfig;
  inputVariables: NodeInputVariable[];
  outputVariables: NodeOutputVariable[];
};

function JavaScriptNodeConfigPane(props: Props) {
  const updateNodeInternals = useUpdateNodeInternals();

  const nodeDefinition = useMemo(
    () => getNodeDefinitionForNodeTypeName(props.nodeConfig.type),
    [props.nodeConfig.type],
  );

  const updateNodeConfig = useFlowStore((s) => s.updateNodeConfig);
  const addVariable = useFlowStore((s) => s.addVariable);

  const inputVariableConfig = useMemo(() => {
    return props.inputVariables.map((variable) => {
      const incomingVariableConfig =
        nodeDefinition.fixedIncomingVariables?.[variable.name];

      return {
        id: variable.id,
        name: variable.name,
        isReadOnly: props.isNodeReadOnly || incomingVariableConfig != null,
        helperText: incomingVariableConfig?.helperMessage,
      };
    });
  }, [
    props.inputVariables,
    props.isNodeReadOnly,
    nodeDefinition.fixedIncomingVariables,
  ]);

  const [javaScriptCode, setJavaScriptCode] = useState(
    () => props.nodeConfig.javaScriptCode,
  );

  const functionDefinitionPrefix = `async function (${props.inputVariables
    .map((v) => v.name)
    .join(', ')}) {`;

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
      <FormControl>
        <NodeFieldLabelWithIconContainer>
          <FormLabel>
            <code>{functionDefinitionPrefix}</code>
          </FormLabel>
          <CopyIconButton
            onClick={() => {
              navigator.clipboard.writeText(`${functionDefinitionPrefix}
${javaScriptCode.split('\n').join('\n  ')}
}`);
            }}
          />
        </NodeFieldLabelWithIconContainer>
        {props.isNodeReadOnly ? (
          <ReadonlyTextarea value={javaScriptCode} minRows={6} isCode />
        ) : (
          <Textarea
            sx={{ fontFamily: 'var(--font-family-mono)' }}
            minRows={6}
            placeholder="Write JavaScript here"
            value={javaScriptCode}
            onChange={(e) => {
              setJavaScriptCode(e.target.value);
            }}
            onKeyDown={(e) => {
              if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                updateNodeConfig(props.nodeId, { javaScriptCode });
              }
            }}
            onBlur={() => {
              updateNodeConfig(props.nodeId, { javaScriptCode });
            }}
          />
        )}
        <code style={{ fontSize: 12 }}>{'}'}</code>
      </FormControl>
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

export default JavaScriptNodeConfigPane;
