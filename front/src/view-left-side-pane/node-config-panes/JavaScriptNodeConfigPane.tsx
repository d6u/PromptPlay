import { Option } from '@mobily/ts-belt';
import { FormLabel, Textarea } from '@mui/joy';
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
import NodeExecutionMessageDisplay from 'components/node-execution-state/NodeExecutionMessageDisplay';
import NodeFieldLabelWithIconContainer from 'components/node-fields/NodeFieldLabelWithIconContainer';
import NodeFieldSectionFormControl from 'components/node-fields/NodeFieldSectionFormControl';
import SidePaneHeaderSection from 'components/side-pane/SidePaneHeaderSection';
import HeaderSectionHeader from 'components/side-pane/SidePaneHeaderSectionHeader';
import SidePaneOutputRenderer from 'components/side-pane/SidePaneOutputRenderer';
import SidePaneSection from 'components/side-pane/SidePaneSection';
import CopyIconButton from 'generic-components/CopyIconButton';
import ReadonlyTextarea from 'generic-components/ReadonlyTextarea';
import { useFlowStore } from 'state-flow/flow-store';
import { NodeExecutionState } from 'state-flow/types';

import { VariableConfig } from 'components/node-connector/types';
import NodeConfigPaneAddConnectorButton from '../node-config-pane-base-ui/NodeConfigPaneAddConnectorButton';
import NodeConfigPaneContainer from '../node-config-pane-base-ui/NodeConfigPaneContainer';

type Props = {
  nodeId: string;
  isNodeReadOnly: boolean;
  nodeConfig: JavaScriptFunctionNodeInstanceLevelConfig;
  inputVariables: NodeInputVariable[];
  outputVariables: NodeOutputVariable[];
  // Node Level but not save to server
  nodeExecutionState: Option<NodeExecutionState>;
};

function JavaScriptNodeConfigPane(props: Props) {
  const updateNodeInternals = useUpdateNodeInternals();

  const nodeDefinition = useMemo(
    () => getNodeDefinitionForNodeTypeName(props.nodeConfig.type),
    [props.nodeConfig.type],
  );

  const updateNodeConfig = useFlowStore((s) => s.updateNodeConfig);
  const addVariable = useFlowStore((s) => s.addVariable);

  const inputVariableConfig: VariableConfig[] = useMemo(() => {
    return props.inputVariables.map((variable) => {
      const incomingVariableConfig =
        nodeDefinition.fixedIncomingVariables?.[variable.name];

      return {
        id: variable.id,
        name: variable.name,
        isGlobal: variable.isGlobal,
        globalVariableId: variable.globalVariableId,
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
      <NodeVariablesEditableList
        variableConfigs={inputVariableConfig}
        isListSortable
        nodeId={props.nodeConfig.nodeId}
        isNodeReadOnly={false}
      />
      <NodeFieldSectionFormControl>
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
      </NodeFieldSectionFormControl>
    </NodeConfigPaneContainer>
  );
}

export default JavaScriptNodeConfigPane;
