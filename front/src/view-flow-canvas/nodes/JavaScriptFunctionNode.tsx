import styled from '@emotion/styled';
import { Option } from '@mobily/ts-belt';
import { FormControl, FormLabel, Textarea } from '@mui/joy';
import { useMemo, useState } from 'react';
import { Position, useUpdateNodeInternals } from 'reactflow';

import {
  ConnectorType,
  IncomingCondition,
  JavaScriptFunctionNodeInstanceLevelConfig,
  NodeClass,
  NodeInputVariable,
  NodeOutputVariable,
  getNodeDefinitionForNodeTypeName,
} from 'flow-models';

import NodeIncomingConditionHandle from 'components/node-connector/condition/NodeIncomingConditionHandle';
import NodeRenamableVariableList from 'components/node-connector/variable/NodeRenamableVariableList';
import NodeFieldLabelWithIconContainer from 'components/node-fields/NodeFieldLabelWithIconContainer';
import CopyIconButton from 'generic-components/CopyIconButton';
import ReadonlyTextarea from 'generic-components/ReadonlyTextarea';
import {
  NodeExecutionState,
  NodeExecutionStatus,
} from 'state-flow/common-types';
import { useFlowStore } from 'state-flow/flow-store';

import NodeRegularOutgoingConditionHandle from 'components/node-connector/condition/NodeRegularOutgoingConditionHandle';
import {
  VariableConfig,
  type VariableDefinition,
} from 'components/node-connector/types';
import NodeOutputVariableList from 'components/node-connector/variable/NodeOutputVariableList';
import NodeExecutionMessageDisplay from 'components/node-execution-state/NodeExecutionMessageDisplay';
import NodeBox from '../node-box/NodeBox';
import NodeBoxHeaderSection from '../node-box/NodeBoxHeaderSection';
import NodeBoxSection from '../node-box/NodeBoxSection';

type Props = {
  nodeId: string;
  isNodeReadOnly: boolean;
  nodeConfig: JavaScriptFunctionNodeInstanceLevelConfig;
  inputVariables: NodeInputVariable[];
  outputVariables: NodeOutputVariable[];
  incomingCondition: IncomingCondition;
  nodeExecutionState: Option<NodeExecutionState>;
};

function JavaScriptFunctionNode(props: Props) {
  const updateNodeInternals = useUpdateNodeInternals();

  const nodeDefinition = useMemo(
    () => getNodeDefinitionForNodeTypeName(props.nodeConfig.type),
    [props.nodeConfig.type],
  );

  const updateNodeConfig = useFlowStore((s) => s.updateNodeConfig);
  const addVariable = useFlowStore((s) => s.addConnector);

  const [javaScriptCode, setJavaScriptCode] = useState(
    () => props.nodeConfig.javaScriptCode,
  );

  const functionDefinitionPrefix = `async function (${props.inputVariables
    .map((v) => v.name)
    .join(', ')}) {`;

  return (
    <>
      <NodeRegularOutgoingConditionHandle nodeId={props.nodeId} />
      <NodeIncomingConditionHandle
        nodeId={props.nodeId}
        conditionId={props.incomingCondition.id}
      />
      <NodeBox
        nodeType={props.nodeConfig.type}
        isRunning={
          props.nodeExecutionState?.status === NodeExecutionStatus.Executing
        }
        hasError={
          props.nodeExecutionState?.status === NodeExecutionStatus.Error
        }
      >
        <NodeBoxHeaderSection
          nodeClass={NodeClass.Process}
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
          <NodeRenamableVariableList
            showConnectorHandle={Position.Left}
            nodeId={props.nodeId}
            isNodeReadOnly={props.isNodeReadOnly}
            variableConfigs={props.inputVariables.map<VariableConfig>(
              (variable) => {
                return {
                  id: variable.id,
                  name: variable.name,
                  isGlobal: variable.isGlobal,
                  globalVariableId: variable.globalVariableId,
                };
              },
            )}
            variableDefinitions={props.inputVariables.map<VariableDefinition>(
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
          <NodeOutputVariableList
            nodeId={props.nodeId}
            isNodeReadOnly={props.isNodeReadOnly}
            variables={props.outputVariables}
          />
        </NodeBoxSection>
        <NodeBoxSection>
          {props.nodeExecutionState?.messages.map((message, index) => (
            <NodeExecutionMessageDisplay key={index} message={message} />
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
