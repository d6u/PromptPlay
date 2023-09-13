import FormControl from "@mui/joy/FormControl";
import FormHelperText from "@mui/joy/FormHelperText";
import FormLabel from "@mui/joy/FormLabel";
import Radio from "@mui/joy/Radio";
import RadioGroup from "@mui/joy/RadioGroup";
import Textarea from "@mui/joy/Textarea";
import { ReactNode, useEffect, useMemo, useState } from "react";
import { ChatGPTMessageRole } from "../../integrations/openai";
import TextareaReadonly from "../flow-common/TextareaReadonly";
import { CopyIcon, LabelWithIconContainer } from "../flow-common/flow-common";
import { FlowState, useFlowStore } from "../flowState";
import { ChatGPTMessageNodeConfig } from "../flowTypes";
import {
  HeaderSection,
  HeaderSectionHeader,
  OutputValueItem,
  OutputValueName,
  PanelContentContainer,
  RawValue,
  Section,
} from "./controls-common";

const selector = (state: FlowState) => ({
  isCurrentUserOwner: state.isCurrentUserOwner,
  nodeConfigs: state.nodeConfigs,
  detailPanelSelectedNodeId: state.detailPanelSelectedNodeId,
  updateNodeConfig: state.updateNodeConfig,
});

export default function PanelChatGPTMessageConfig() {
  const {
    isCurrentUserOwner,
    nodeConfigs,
    detailPanelSelectedNodeId,
    updateNodeConfig,
  } = useFlowStore(selector);

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
        {nodeConfig.outputs.map((output) => {
          let content: ReactNode;

          if (typeof output?.value === "string") {
            content = output?.value;
          } else {
            content = JSON.stringify(output?.value, null, 2);
          }

          return (
            <OutputValueItem key={output.id}>
              <OutputValueName>{output.name}</OutputValueName>
              <RawValue key={output.id}>{content}</RawValue>
            </OutputValueItem>
          );
        })}
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
