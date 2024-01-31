import FormControl from '@mui/joy/FormControl';
import FormHelperText from '@mui/joy/FormHelperText';
import FormLabel from '@mui/joy/FormLabel';
import IconButton from '@mui/joy/IconButton';
import Textarea from '@mui/joy/Textarea';
import ReactFlowNode from 'canvas-react-flow/ReactFlowNode';
import NodeBoxIconGear from 'canvas-react-flow/node-box/NodeBoxIconGear';
import NodeBoxSection from 'canvas-react-flow/node-box/NodeBoxSection';
import { NodeID, NodeType, V3TextTemplateNodeConfig } from 'flow-models';
import { useContext, useEffect, useMemo, useState } from 'react';
import { useNodeId } from 'reactflow';
import RouteFlowContext from '../../../route-flow/common/RouteFlowContext';
import TextareaReadonly from '../../../route-flow/common/TextareaReadonly';
import {
  CopyIcon,
  LabelWithIconContainer,
} from '../../../route-flow/common/flow-common';
import { useFlowStore } from '../../../route-flow/store/FlowStoreContext';
import { DetailPanelContentType } from '../../../route-flow/store/store-flow-state-types';

export default function TextTemplateNode() {
  const { isCurrentUserOwner } = useContext(RouteFlowContext);

  const nodeId = useNodeId() as NodeID;

  const nodeConfigs = useFlowStore((s) => s.nodeConfigsDict);
  const updateNodeConfig = useFlowStore((s) => s.updateNodeConfig);
  const setDetailPanelContentType = useFlowStore(
    (s) => s.setDetailPanelContentType,
  );
  const setDetailPanelSelectedNodeId = useFlowStore(
    (s) => s.setDetailPanelSelectedNodeId,
  );

  const nodeConfig = useMemo(() => {
    return nodeConfigs[nodeId] as V3TextTemplateNodeConfig | undefined;
  }, [nodeConfigs, nodeId]);

  // It's OK to force unwrap here because nodeConfig will be undefined only
  // when Node is being deleted.
  const [content, setContent] = useState(() => nodeConfig!.content);

  useEffect(() => {
    setContent(() => nodeConfig?.content ?? '');
  }, [nodeConfig]);

  if (!nodeConfig) {
    // NOTE: This will happen when the node is removed in store, but not yet
    // reflected in react-flow store.
    return null;
  }

  return (
    <ReactFlowNode
      isNodeConfigReadOnly={!isCurrentUserOwner}
      nodeType={NodeType.TextTemplate}
      nodeTitle="Text"
      canAddVariable={true}
    >
      <NodeBoxSection>
        <FormControl>
          <LabelWithIconContainer>
            <FormLabel>Text content</FormLabel>
            <CopyIcon
              onClick={() => {
                navigator.clipboard.writeText(content);
              }}
            />
          </LabelWithIconContainer>
          {isCurrentUserOwner ? (
            <Textarea
              color="neutral"
              variant="outlined"
              minRows={3}
              maxRows={5}
              placeholder="Write JavaScript here"
              value={content}
              onChange={(e) => {
                setContent(e.target.value);
              }}
              onKeyDown={(e) => {
                if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                  updateNodeConfig(nodeId, { content });
                }
              }}
              onBlur={() => {
                updateNodeConfig(nodeId, { content });
              }}
            />
          ) : (
            <TextareaReadonly value={content} minRows={3} maxRows={5} />
          )}
          <FormHelperText>
            <div>
              <a
                href="https://mustache.github.io/"
                target="_blank"
                rel="noreferrer"
              >
                Mustache template
              </a>{' '}
              is used here. TL;DR: use <code>{'{{variableName}}'}</code> to
              insert a variable.
            </div>
          </FormHelperText>
        </FormControl>
      </NodeBoxSection>
      <NodeBoxSection>
        <IconButton
          variant="outlined"
          onClick={() => {
            setDetailPanelContentType(
              DetailPanelContentType.ChatGPTMessageConfig,
            );
            setDetailPanelSelectedNodeId(nodeId);
          }}
        >
          <NodeBoxIconGear />
        </IconButton>
      </NodeBoxSection>
    </ReactFlowNode>
  );
}
