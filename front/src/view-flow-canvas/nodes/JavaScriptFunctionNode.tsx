import { FormControl, FormLabel, Textarea } from '@mui/joy';
import { useState } from 'react';

import {
  ConditionTarget,
  JavaScriptFunctionNodeInstanceLevelConfig,
  NodeInputVariable,
  NodeOutputVariable,
} from 'flow-models';

import NodeFieldLabelWithIconContainer from 'components/node-fields/NodeFieldLabelWithIconContainer';
import CopyIconButton from 'generic-components/CopyIconButton';
import ReadonlyTextarea from 'generic-components/ReadonlyTextarea';
import { useFlowStore } from 'state-flow/flow-store';

import DefaultNode from '../node-box/DefaultNode';
import NodeBoxSection from '../node-box/NodeBoxSection';

type Props = {
  nodeId: string;
  isNodeConfigReadOnly: boolean;
  nodeConfig: JavaScriptFunctionNodeInstanceLevelConfig;
  inputVariables: NodeInputVariable[];
  outputVariables: NodeOutputVariable[];
  conditionTarget: ConditionTarget;
};

function JavaScriptFunctionNode(props: Props) {
  const updateNodeConfig = useFlowStore((s) => s.updateNodeConfig);

  // It's OK to force unwrap here because nodeConfig will be undefined only
  // when Node is being deleted.
  const [javaScriptCode, setJavaScriptCode] = useState(
    () => props.nodeConfig.javaScriptCode,
  );

  const functionDefinitionPrefix = `async function (${props.inputVariables
    .map((v) => v.name)
    .join(', ')}) {`;

  return (
    <DefaultNode
      nodeId={props.nodeId}
      isNodeConfigReadOnly={!props.isNodeConfigReadOnly}
      nodeConfig={props.nodeConfig}
      inputVariables={props.inputVariables}
      outputVariables={props.outputVariables}
      conditionTarget={props.conditionTarget}
    >
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
          {props.isNodeConfigReadOnly ? (
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
          ) : (
            <ReadonlyTextarea value={javaScriptCode} minRows={6} isCode />
          )}
          <code style={{ fontSize: 12 }}>{'}'}</code>
        </FormControl>
      </NodeBoxSection>
    </DefaultNode>
  );
}

export default JavaScriptFunctionNode;
