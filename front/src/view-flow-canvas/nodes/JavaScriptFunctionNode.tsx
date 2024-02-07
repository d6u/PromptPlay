import { FormControl, FormLabel, Textarea } from '@mui/joy';
import { useContext, useMemo, useState } from 'react';
import { useNodeId } from 'reactflow';

import {
  ConnectorType,
  JavaScriptFunctionNodeInstanceLevelConfig,
  NodeID,
} from 'flow-models';

import RouteFlowContext from 'state-flow/context/FlowRouteContext';
import { useFlowStore } from 'state-flow/context/FlowStoreContext';
import { selectVariables } from 'state-flow/util/state-utils';

import NodeBoxCopyIcon from '../node-box/NodeBoxCopyIcon';
import NodeBoxLabelWithIconContainer from '../node-box/NodeBoxLabelWithIconContainer';
import NodeBoxSection from '../node-box/NodeBoxSection';
import TextareaReadonly from '../node-box/NodeBoxTextareaReadonly';
import ReactFlowNode from './ReactFlowNode';

function JavaScriptFunctionNode() {
  const { isCurrentUserOwner } = useContext(RouteFlowContext);

  const nodeId = useNodeId() as NodeID;

  const nodeConfigsDict = useFlowStore((s) => s.nodeConfigsDict);
  const variablesDict = useFlowStore((s) => s.variablesDict);
  const updateNodeConfig = useFlowStore((s) => s.updateNodeConfig);

  const inputs = useMemo(() => {
    return selectVariables(nodeId, ConnectorType.NodeInput, variablesDict);
  }, [nodeId, variablesDict]);

  const nodeConfig = useMemo(
    () =>
      nodeConfigsDict[nodeId] as
        | JavaScriptFunctionNodeInstanceLevelConfig
        | undefined,
    [nodeConfigsDict, nodeId],
  );

  // It's OK to force unwrap here because nodeConfig will be undefined only
  // when Node is being deleted.
  const [javaScriptCode, setJavaScriptCode] = useState(
    () => nodeConfig!.javaScriptCode,
  );

  if (!nodeConfig) {
    return null;
  }

  const functionDefinitionPrefix = `async function (${inputs
    .map((v) => v.name)
    .join(', ')}) {`;

  return (
    <ReactFlowNode
      isNodeConfigReadOnly={!isCurrentUserOwner}
      nodeConfig={nodeConfig}
    >
      <NodeBoxSection>
        <FormControl>
          <NodeBoxLabelWithIconContainer>
            <FormLabel>
              <code>{functionDefinitionPrefix}</code>
            </FormLabel>
            <NodeBoxCopyIcon
              onClick={() => {
                navigator.clipboard.writeText(`${functionDefinitionPrefix}
  ${javaScriptCode.split('\n').join('\n  ')}
}`);
              }}
            />
          </NodeBoxLabelWithIconContainer>
          {isCurrentUserOwner ? (
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
                  updateNodeConfig(nodeId, { javaScriptCode });
                }
              }}
              onBlur={() => {
                updateNodeConfig(nodeId, { javaScriptCode });
              }}
            />
          ) : (
            <TextareaReadonly value={javaScriptCode} minRows={6} isCode />
          )}
          <code style={{ fontSize: 12 }}>{'}'}</code>
        </FormControl>
      </NodeBoxSection>
    </ReactFlowNode>
  );
}

export default JavaScriptFunctionNode;
