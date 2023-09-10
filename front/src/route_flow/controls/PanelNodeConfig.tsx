import FormControl from "@mui/joy/FormControl";
import FormHelperText from "@mui/joy/FormHelperText";
import FormLabel from "@mui/joy/FormLabel";
import Radio from "@mui/joy/Radio";
import RadioGroup from "@mui/joy/RadioGroup";
import Textarea from "@mui/joy/Textarea";
import { ReactNode, useEffect, useMemo, useState } from "react";
import { ChatGPTMessageRole } from "../../integrations/openai";
import { FlowState, useFlowStore } from "../flowState";
import { NodeType } from "../flowTypes";
import CodeHelperText from "../nodes/shared/CodeHelperText";
import {
  CopyIcon,
  LabelWithIconContainer,
} from "../nodes/shared/commonStyledComponents";
import {
  HeaderSection,
  HeaderSectionHeader,
  OutputValueItem,
  OutputValueName,
  PanelContentContainer,
  RawValue,
  Section,
} from "./commonStyledComponents";

const selector = (state: FlowState) => ({
  nodeConfigs: state.nodeConfigs,
  detailPanelSelectedNodeId: state.detailPanelSelectedNodeId,
  updateNodeConfig: state.updateNodeConfig,
});

export default function PanelNodeConfig() {
  const { nodeConfigs, detailPanelSelectedNodeId, updateNodeConfig } =
    useFlowStore(selector);

  const nodeConfig = useMemo(
    () =>
      detailPanelSelectedNodeId
        ? nodeConfigs[detailPanelSelectedNodeId] ?? null
        : null,
    [detailPanelSelectedNodeId, nodeConfigs]
  );

  const [role, setRole] = useState(() =>
    nodeConfig?.nodeType === NodeType.ChatGPTMessageNode
      ? nodeConfig!.role
      : ChatGPTMessageRole.user
  );
  const [content, setContent] = useState<string>(
    nodeConfig?.nodeType === NodeType.ChatGPTMessageNode
      ? nodeConfig?.content ?? ""
      : ""
  );

  useEffect(() => {
    if (nodeConfig?.nodeType === NodeType.ChatGPTMessageNode) {
      setRole(nodeConfig?.role ?? ChatGPTMessageRole.user);
    }
  }, [nodeConfig]);

  useEffect(() => {
    if (nodeConfig?.nodeType === NodeType.ChatGPTMessageNode) {
      setContent(nodeConfig?.content ?? "");
    }
  }, [nodeConfig]);

  return (
    <PanelContentContainer>
      <HeaderSection>
        <HeaderSectionHeader>Output variables</HeaderSectionHeader>
      </HeaderSection>
      <Section>
        {nodeConfig && "outputs" in nodeConfig
          ? nodeConfig.outputs.map((output) => {
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
            })
          : null}
      </Section>
      {nodeConfig?.nodeType === NodeType.ChatGPTMessageNode ? (
        <>
          <HeaderSection>
            <HeaderSectionHeader>Config</HeaderSectionHeader>
          </HeaderSection>
          <Section>
            <FormControl>
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
                  variant="outlined"
                  name="role"
                  label="system"
                  // disabled={props.isReadOnly}
                  value={ChatGPTMessageRole.system}
                />
                <Radio
                  variant="outlined"
                  name="role"
                  label="user"
                  // disabled={props.isReadOnly}
                  value={ChatGPTMessageRole.user}
                />
                <Radio
                  variant="outlined"
                  name="role"
                  label="assistant"
                  // disabled={props.isReadOnly}
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
                    navigator.clipboard.writeText(nodeConfig.content);
                  }}
                />
              </LabelWithIconContainer>
              <Textarea
                color="neutral"
                size="sm"
                variant="outlined"
                minRows={6}
                placeholder="Write JavaScript here"
                // disabled={props.isReadOnly}
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
              <FormHelperText>
                <div>
                  <a
                    href="https://mustache.github.io/"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Mustache template
                  </a>{" "}
                  is used here. TL;DR: use{" "}
                  <CodeHelperText>{"{{variableName}}"}</CodeHelperText> to
                  insert a variable.
                </div>
              </FormHelperText>
            </FormControl>
          </Section>
        </>
      ) : null}
    </PanelContentContainer>
  );
}
