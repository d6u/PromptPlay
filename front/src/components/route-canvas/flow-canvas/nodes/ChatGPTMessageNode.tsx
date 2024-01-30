import FormControl from '@mui/joy/FormControl';
import FormHelperText from '@mui/joy/FormHelperText';
import FormLabel from '@mui/joy/FormLabel';
import IconButton from '@mui/joy/IconButton';
import Radio from '@mui/joy/Radio';
import RadioGroup from '@mui/joy/RadioGroup';
import Textarea from '@mui/joy/Textarea';
import { NodeID, NodeType, V3ChatGPTMessageNodeConfig } from 'flow-models';
import { ChatGPTMessageRole } from 'integrations/openai';
import { useContext, useEffect, useMemo, useState } from 'react';
import { useNodeId } from 'reactflow';
import NodeBoxIconGear from '../../../common-react-flow/node-box/NodeBoxIconGear';
import RouteFlowContext from '../../../route-flow/common/RouteFlowContext';
import TextareaReadonly from '../../../route-flow/common/TextareaReadonly';
import {
  CopyIcon,
  LabelWithIconContainer,
} from '../../../route-flow/common/flow-common';
import { useFlowStore } from '../../../route-flow/store/FlowStoreContext';
import { DetailPanelContentType } from '../../../route-flow/store/store-flow-state-types';
import ReactFlowNode from '../nodeV2/ReactFlowNode';
import { Section } from './node-common/node-common';

export default function ChatGPTMessageNode() {
  const { isCurrentUserOwner } = useContext(RouteFlowContext);

  // ANCHOR: ReactFlow
  const nodeId = useNodeId() as NodeID;

  // ANCHOR: Store Data
  const nodeConfigsDict = useFlowStore((s) => s.nodeConfigsDict);
  const nodeConfig = useMemo(() => {
    return nodeConfigsDict[nodeId] as V3ChatGPTMessageNodeConfig | undefined;
  }, [nodeConfigsDict, nodeId]);

  const updateNodeConfig = useFlowStore((s) => s.updateNodeConfig);
  const setDetailPanelContentType = useFlowStore(
    (s) => s.setDetailPanelContentType,
  );
  const setDetailPanelSelectedNodeId = useFlowStore(
    (s) => s.setDetailPanelSelectedNodeId,
  );

  // NOTE: It's OK to force unwrap here because nodeConfig will be undefined
  // only when Node is being deleted.
  const [role, setRole] = useState(() => nodeConfig!.role);

  useEffect(() => {
    setRole(nodeConfig?.role ?? ChatGPTMessageRole.user);
  }, [nodeConfig]);

  const [content, setContent] = useState(() => nodeConfig!.content);

  useEffect(() => {
    setContent(() => nodeConfig!.content ?? '');
  }, [nodeConfig]);

  if (!nodeConfig) {
    // NOTE: This will happen when the node is removed in store, but not yet
    // reflected in react-flow store.
    return null;
  }

  return (
    <ReactFlowNode
      nodeType={NodeType.ChatGPTMessageNode}
      nodeTitle="ChatGPT Message"
      allowAddVariable={true}
      destConnectorReadOnlyConfigs={[true]}
      destConnectorHelpMessages={[
        <>
          <code>messages</code> is a list of ChatGPT message. It's default to an
          empty list if unspecified. The current message will be appended to the
          list and output as the <code>messages</code> output.
        </>,
      ]}
    >
      <Section>
        <FormControl>
          <FormLabel>Role</FormLabel>
          <RadioGroup
            orientation="horizontal"
            value={role}
            onChange={(e) => {
              const role = e.target.value as ChatGPTMessageRole;

              setRole(role);

              updateNodeConfig(nodeId, { role });
            }}
          >
            <Radio
              color="primary"
              name="role"
              label="system"
              disabled={!isCurrentUserOwner}
              value={ChatGPTMessageRole.system}
            />
            <Radio
              color="primary"
              name="role"
              label="user"
              disabled={!isCurrentUserOwner}
              value={ChatGPTMessageRole.user}
            />
            <Radio
              color="primary"
              name="role"
              label="assistant"
              disabled={!isCurrentUserOwner}
              value={ChatGPTMessageRole.assistant}
            />
          </RadioGroup>
        </FormControl>
      </Section>
      <Section>
        <FormControl>
          <LabelWithIconContainer>
            <FormLabel>Message content</FormLabel>
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
      </Section>
      <Section>
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
      </Section>
    </ReactFlowNode>
  );
}
