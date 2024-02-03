import {
  FormControl,
  FormHelperText,
  FormLabel,
  Radio,
  RadioGroup,
  Textarea,
} from '@mui/joy';
import NodeBoxCopyIcon from 'canvas-react-flow/node-box/NodeBoxCopyIcon';
import NodeBoxLabelWithIconContainer from 'canvas-react-flow/node-box/NodeBoxLabelWithIconContainer';
import TextareaReadonly from 'canvas-react-flow/node-box/NodeBoxTextareaReadonly';
import { ConnectorType, NodeType } from 'flow-models';
import { ChatGPTMessageRole } from 'integrations/openai';
import { useContext, useEffect, useMemo, useState } from 'react';
import RouteFlowContext from 'route-flow/common/RouteFlowContext';
import { useStoreFromFlowStoreContext } from 'route-flow/store/FlowStoreContext';
import { selectVariables } from 'route-flow/store/state-utils';
import invariant from 'tiny-invariant';
import { useStore } from 'zustand';
import OutputRenderer from '../common/OutputRenderer';
import {
  HeaderSection,
  HeaderSectionHeader,
  PanelContentContainer,
  Section,
} from '../common/controls-common';

export default function PanelChatGPTMessageConfig() {
  const { isCurrentUserOwner } = useContext(RouteFlowContext);
  const flowStore = useStoreFromFlowStoreContext();

  const nodeConfigsDict = useStore(flowStore, (s) => s.nodeConfigsDict);
  const variablesDict = useStore(flowStore, (s) => s.variablesDict);
  const detailPanelSelectedNodeId = useStore(
    flowStore,
    (s) => s.detailPanelSelectedNodeId,
  );
  const updateNodeConfig = useStore(flowStore, (s) => s.updateNodeConfig);

  invariant(detailPanelSelectedNodeId != null);

  const nodeConfig = useMemo(() => {
    return nodeConfigsDict[detailPanelSelectedNodeId];
  }, [detailPanelSelectedNodeId, nodeConfigsDict]);

  invariant(nodeConfig.type === NodeType.ChatGPTMessageNode);

  const outputs = useMemo(() => {
    return selectVariables(
      detailPanelSelectedNodeId,
      ConnectorType.NodeOutput,
      variablesDict,
    );
  }, [detailPanelSelectedNodeId, variablesDict]);

  const [role, setRole] = useState(() => nodeConfig.role);
  const [content, setContent] = useState<string>(() => nodeConfig?.content);

  useEffect(() => {
    setRole(nodeConfig.role);
  }, [nodeConfig.role]);

  useEffect(() => {
    setContent(nodeConfig.content);
  }, [nodeConfig.content]);

  return (
    <PanelContentContainer>
      <HeaderSection>
        <HeaderSectionHeader>Output variables</HeaderSectionHeader>
      </HeaderSection>
      <Section>
        {outputs.map((output) => (
          <OutputRenderer key={output.id} outputItem={output} />
        ))}
      </Section>
      <HeaderSection>
        <HeaderSectionHeader>Config</HeaderSectionHeader>
      </HeaderSection>
      <Section>
        <FormControl size="md">
          <FormLabel>Role</FormLabel>
          <RadioGroup
            orientation="horizontal"
            value={role}
            onChange={(e) => {
              const role = e.target.value as ChatGPTMessageRole;

              setRole(role);

              updateNodeConfig(detailPanelSelectedNodeId, { role });
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
        <FormControl size="md">
          <NodeBoxLabelWithIconContainer>
            <FormLabel>Message content</FormLabel>
            <NodeBoxCopyIcon
              onClick={() => {
                navigator.clipboard.writeText(nodeConfig.content);
              }}
            />
          </NodeBoxLabelWithIconContainer>
          {isCurrentUserOwner ? (
            <Textarea
              color="neutral"
              size="sm"
              variant="outlined"
              minRows={6}
              placeholder="Write JavaScript here"
              value={content}
              onChange={(e) => {
                setContent(e.target.value);
              }}
              onKeyDown={(e) => {
                if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                  updateNodeConfig(detailPanelSelectedNodeId, { content });
                }
              }}
              onBlur={() => {
                updateNodeConfig(detailPanelSelectedNodeId, { content });
              }}
            />
          ) : (
            <TextareaReadonly value={content} minRows={6} />
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
    </PanelContentContainer>
  );
}
