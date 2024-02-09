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

import CopyIconButton from '../../components/generic/CopyIconButton';
import ReadonlyTextarea from '../../components/generic/ReadonlyTextarea';
import NodeFieldLabelWithIconContainer from '../../components/node-fields/NodeFieldLabelWithIconContainer';
import NodeBoxSection from '../node-box/NodeBoxSection';
import ReactFlowNode from '../node-box/ReactFlowNode';

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
            <ReadonlyTextarea value={javaScriptCode} minRows={6} isCode />
          )}
          <code style={{ fontSize: 12 }}>{'}'}</code>
        </FormControl>
      </NodeBoxSection>
    </ReactFlowNode>
  );
}

export default JavaScriptFunctionNode;
