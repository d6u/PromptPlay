import {
  Radio,
  FormLabel,
  FormHelperText,
  FormControl,
  Textarea,
  RadioGroup,
} from "@mui/joy";
import { useContext, useEffect, useMemo, useState } from "react";
import { ChatGPTMessageRole } from "../../../../integrations/openai";
import FlowContext from "../../FlowContext";
import TextareaReadonly from "../../flow-common/TextareaReadonly";
import {
  CopyIcon,
  LabelWithIconContainer,
} from "../../flow-common/flow-common";
import { useFlowStore } from "../../store/store-flow";
import { ChatGPTMessageNodeConfig } from "../../store/types-flow-content";
import { FlowState } from "../../store/types-local-state";
import OutputRenderer from "../common/OutputRenderer";
import {
  HeaderSection,
  HeaderSectionHeader,
  PanelContentContainer,
  Section,
} from "../common/controls-common";

const selector = (state: FlowState) => ({
  nodeConfigs: state.nodeConfigs,
  detailPanelSelectedNodeId: state.detailPanelSelectedNodeId,
  updateNodeConfig: state.updateNodeConfig,
});

export default function PanelChatGPTMessageConfig() {
  const { isCurrentUserOwner } = useContext(FlowContext);

  const { nodeConfigs, detailPanelSelectedNodeId, updateNodeConfig } =
    useFlowStore(selector);

  const nodeConfig = useMemo(
    () => nodeConfigs[detailPanelSelectedNodeId!] as ChatGPTMessageNodeConfig,
    [detailPanelSelectedNodeId, nodeConfigs]
  );

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
        {nodeConfig.outputs.map((output) => (
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

              updateNodeConfig(detailPanelSelectedNodeId!, { role });
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
          <LabelWithIconContainer>
            <FormLabel>Message content</FormLabel>
            <CopyIcon
              onClick={() => {
                navigator.clipboard.writeText(nodeConfig.content);
              }}
            />
          </LabelWithIconContainer>
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
                if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
                  updateNodeConfig(detailPanelSelectedNodeId!, { content });
                }
              }}
              onBlur={() => {
                updateNodeConfig(detailPanelSelectedNodeId!, { content });
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
              </a>{" "}
              is used here. TL;DR: use <code>{"{{variableName}}"}</code> to
              insert a variable.
            </div>
          </FormHelperText>
        </FormControl>
      </Section>
    </PanelContentContainer>
  );
}
