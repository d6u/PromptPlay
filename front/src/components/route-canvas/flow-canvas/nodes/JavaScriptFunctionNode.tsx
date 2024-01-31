import FormControl from '@mui/joy/FormControl';
import FormLabel from '@mui/joy/FormLabel';
import Textarea from '@mui/joy/Textarea';
import ReactFlowNode from 'canvas-react-flow/ReactFlowNode';
import NodeBoxSection from 'canvas-react-flow/node-box/NodeBoxSection';
import {
  ConnectorType,
  NodeID,
  NodeType,
  V3JavaScriptFunctionNodeConfig,
} from 'flow-models';
import { useContext, useMemo, useState } from 'react';
import { useNodeId } from 'reactflow';
import RouteFlowContext from '../../../route-flow/common/RouteFlowContext';
import TextareaReadonly from '../../../route-flow/common/TextareaReadonly';
import {
  CopyIcon,
  LabelWithIconContainer,
} from '../../../route-flow/common/flow-common';
import { useFlowStore } from '../../../route-flow/store/FlowStoreContext';
import { selectVariables } from '../../../route-flow/store/state-utils';

export default function JavaScriptFunctionNode() {
  const { isCurrentUserOwner } = useContext(RouteFlowContext);

  const nodeId = useNodeId() as NodeID;

  const nodeConfigsDict = useFlowStore((s) => s.nodeConfigsDict);
  const variablesDict = useFlowStore((s) => s.variablesDict);
  const updateNodeConfig = useFlowStore((s) => s.updateNodeConfig);

  const inputs = useMemo(() => {
    return selectVariables(nodeId, ConnectorType.NodeInput, variablesDict);
  }, [nodeId, variablesDict]);

  const nodeConfig = useMemo(
    () => nodeConfigsDict[nodeId] as V3JavaScriptFunctionNodeConfig | undefined,
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
      nodeType={NodeType.JavaScriptFunctionNode}
      nodeTitle="JavaScript"
      canAddVariable={true}
    >
      <NodeBoxSection>
        <FormControl>
          <LabelWithIconContainer>
            <FormLabel>
              <code>{functionDefinitionPrefix}</code>
            </FormLabel>
            <CopyIcon
              onClick={() => {
                navigator.clipboard.writeText(`${functionDefinitionPrefix}
  ${javaScriptCode.split('\n').join('\n  ')}
}`);
              }}
            />
          </LabelWithIconContainer>
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
