import styled from '@emotion/styled';
import { Option } from '@mobily/ts-belt';
import { FormControl, FormLabel, Textarea } from '@mui/joy';
import { useMemo, useState } from 'react';
import { Position, useUpdateNodeInternals } from 'reactflow';

import {
  ConditionTarget,
  ConnectorType,
  JavaScriptFunctionNodeInstanceLevelConfig,
  NodeInputVariable,
  NodeOutputVariable,
  getNodeDefinitionForNodeTypeName,
} from 'flow-models';

import NodeTargetConditionHandle from 'components/node-connector/NodeTargetConditionHandle';
import NodeVariableResultItem from 'components/node-connector/NodeVariableResultItem';
import NodeVariablesEditableList from 'components/node-connector/NodeVariablesEditableList';
import NodeFieldLabelWithIconContainer from 'components/node-fields/NodeFieldLabelWithIconContainer';
import CopyIconButton from 'generic-components/CopyIconButton';
import ReadonlyTextarea from 'generic-components/ReadonlyTextarea';
import { useFlowStore } from 'state-flow/flow-store';
import { NodeExecutionState, NodeExecutionStatus } from 'state-flow/types';

import NodeBox from '../node-box/NodeBox';
import NodeBoxHeaderSection from '../node-box/NodeBoxHeaderSection';
import NodeBoxSection from '../node-box/NodeBoxSection';
import { SrcConnector } from './DefaultNode';

type Props = {
  nodeId: string;
  isNodeReadOnly: boolean;
  nodeConfig: JavaScriptFunctionNodeInstanceLevelConfig;
  inputVariables: NodeInputVariable[];
  outputVariables: NodeOutputVariable[];
  conditionTarget: ConditionTarget;
  nodeExecuteState: Option<NodeExecutionState>;
};

function JavaScriptFunctionNode(props: Props) {
  const updateNodeInternals = useUpdateNodeInternals();

  const nodeDefinition = useMemo(
    () => getNodeDefinitionForNodeTypeName(props.nodeConfig.type),
    [props.nodeConfig.type],
  );

  const updateNodeConfig = useFlowStore((s) => s.updateNodeConfig);
  const addVariable = useFlowStore((s) => s.addVariable);

  const defaultVariableValueMap = useFlowStore((s) =>
    s.getDefaultVariableValueLookUpDict(),
  );

  const srcConnectors = useMemo(() => {
    return props.outputVariables.map<SrcConnector>((output) => {
      return {
        id: output.id,
        name: output.name,
        value: defaultVariableValueMap[output.id],
      };
    });
  }, [props.outputVariables, defaultVariableValueMap]);

  const [javaScriptCode, setJavaScriptCode] = useState(
    () => props.nodeConfig.javaScriptCode,
  );

  const functionDefinitionPrefix = `async function (${props.inputVariables
    .map((v) => v.name)
    .join(', ')}) {`;

  return (
    <>
      <NodeTargetConditionHandle
        nodeId={props.nodeId}
        conditionId={props.conditionTarget.id}
      />
      <NodeBox
        nodeType={props.nodeConfig.type}
        isRunning={
          props.nodeExecuteState?.status === NodeExecutionStatus.Executing
        }
        hasError={props.nodeExecuteState?.status === NodeExecutionStatus.Error}
      >
        <NodeBoxHeaderSection
          title={nodeDefinition.label}
          showAddVariableButton={!!nodeDefinition.canUserAddIncomingVariables}
          nodeId={props.nodeId}
          isNodeReadOnly={props.isNodeReadOnly}
          onClickAddVariableButton={() => {
            addVariable(
              props.nodeId,
              ConnectorType.NodeInput,
              props.inputVariables.length,
            );
            updateNodeInternals(props.nodeId);
          }}
        />
        <GenericContainer>
          <NodeVariablesEditableList
            showConnectorHandle={Position.Left}
            nodeId={props.nodeId}
            isNodeReadOnly={props.isNodeReadOnly}
            variableConfigs={props.inputVariables.map((variable) => {
              const incomingVariableConfig =
                nodeDefinition.fixedIncomingVariables?.[variable.name];

              return {
                id: variable.id,
                name: variable.name,
                isReadOnly: incomingVariableConfig != null,
                helperMessage: incomingVariableConfig?.helperMessage,
              };
            })}
          />
        </GenericContainer>
        <NodeBoxSection>
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
        </NodeBoxSection>
        <NodeBoxSection>
          {srcConnectors.map((connector) => (
            <NodeVariableResultItem
              key={connector.id}
              variableId={connector.id}
              variableName={connector.name}
              variableValue={connector.value}
              nodeId={props.nodeId}
            />
          ))}
        </NodeBoxSection>
      </NodeBox>
    </>
  );
}

const GenericContainer = styled.div`
  padding-left: 10px;
  padding-right: 10px;
`;

export default JavaScriptFunctionNode;
