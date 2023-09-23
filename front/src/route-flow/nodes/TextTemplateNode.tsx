import FormControl from "@mui/joy/FormControl";
import FormHelperText from "@mui/joy/FormHelperText";
import FormLabel from "@mui/joy/FormLabel";
import IconButton from "@mui/joy/IconButton";
import Textarea from "@mui/joy/Textarea";
import Chance from "chance";
import { adjust, append, assoc, remove } from "ramda";
import { useContext, useEffect, useMemo, useState } from "react";
import { Position, useUpdateNodeInternals, useNodeId } from "reactflow";
import randomId from "../../util/randomId";
import FlowContext from "../FlowContext";
import TextareaReadonly from "../flow-common/TextareaReadonly";
import { CopyIcon, LabelWithIconContainer } from "../flow-common/flow-common";
import { useFlowStore } from "../store/store-flow";
import {
  InputID,
  NodeID,
  NodeInputItem,
  NodeType,
  TextTemplateNodeConfig,
} from "../store/types-flow-content";
import { FlowState } from "../store/types-local-state";
import { DetailPanelContentType } from "../store/types-local-state";
import AddVariableButton from "./node-common/AddVariableButton";
import HeaderSection from "./node-common/HeaderSection";
import NodeBox from "./node-common/NodeBox";
import NodeInputModifyRow from "./node-common/NodeInputModifyRow";
import NodeOutputRow from "./node-common/NodeOutputRow";
import {
  InputHandle,
  OutputHandle,
  Section,
  SmallSection,
  StyledIconGear,
} from "./node-common/node-common";
import {
  calculateInputHandleTop,
  calculateOutputHandleBottom,
} from "./node-common/utils";

const chance = new Chance();

const selector = (state: FlowState) => ({
  nodeConfigs: state.nodeConfigs,
  updateNodeConfig: state.updateNodeConfig,
  removeNode: state.removeNode,
  setDetailPanelContentType: state.setDetailPanelContentType,
  setDetailPanelSelectedNodeId: state.setDetailPanelSelectedNodeId,
  defaultVariableValueMap: state.getDefaultVariableValueMap(),
});

export default function TextTemplateNode() {
  const { isCurrentUserOwner } = useContext(FlowContext);

  const nodeId = useNodeId() as NodeID;

  const {
    nodeConfigs,
    updateNodeConfig,
    removeNode,
    setDetailPanelContentType,
    setDetailPanelSelectedNodeId,
    defaultVariableValueMap,
  } = useFlowStore(selector);

  const nodeConfig = useMemo(
    () => nodeConfigs[nodeId] as TextTemplateNodeConfig | undefined,
    [nodeConfigs, nodeId]
  );

  const updateNodeInternals = useUpdateNodeInternals();

  // It's OK to force unwrap here because nodeConfig will be undefined only
  // when Node is being deleted.
  const [inputs, setInputs] = useState(() => nodeConfig!.inputs);
  const [content, setContent] = useState(() => nodeConfig!.content);

  useEffect(() => {
    setContent(() => nodeConfig!.content ?? "");
  }, [nodeConfig]);

  if (!nodeConfig) {
    return null;
  }

  return (
    <>
      {inputs.map((input, i) => (
        <InputHandle
          key={i}
          type="target"
          id={input.id}
          position={Position.Left}
          style={{
            top: calculateInputHandleTop(i - (isCurrentUserOwner ? 0 : 1)),
          }}
        />
      ))}
      <NodeBox nodeType={NodeType.TextTemplate}>
        <HeaderSection
          isCurrentUserOwner={isCurrentUserOwner}
          title="Text"
          onClickRemove={() => removeNode(nodeId)}
        />
        {isCurrentUserOwner && (
          <SmallSection>
            <AddVariableButton
              onClick={() => {
                const newInputs = append<NodeInputItem>({
                  id: `${nodeId}/${randomId()}` as InputID,
                  name: chance.word(),
                })(inputs);

                setInputs(newInputs);

                updateNodeConfig(nodeId, { inputs: newInputs });

                updateNodeInternals(nodeId);
              }}
            />
          </SmallSection>
        )}
        <Section>
          {inputs.map((input, i) => (
            <NodeInputModifyRow
              key={input.id}
              name={input.name}
              isReadOnly={!isCurrentUserOwner}
              onConfirmNameChange={(name) => {
                const newInputs = adjust<NodeInputItem>(
                  i,
                  assoc("name", name)<NodeInputItem>
                )(inputs);

                setInputs(newInputs);

                updateNodeConfig(nodeId, { inputs: newInputs });
              }}
              onRemove={() => {
                const newInputs = remove(i, 1, inputs);

                setInputs(newInputs);

                updateNodeConfig(nodeId, { inputs: newInputs });

                updateNodeInternals(nodeId);
              }}
            />
          ))}
        </Section>
        <Section>
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
                  if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
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
                </a>{" "}
                is used here. TL;DR: use <code>{"{{variableName}}"}</code> to
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
                DetailPanelContentType.ChatGPTMessageConfig
              );
              setDetailPanelSelectedNodeId(nodeId);
            }}
          >
            <StyledIconGear />
          </IconButton>
        </Section>
        <Section>
          {nodeConfig.outputs.map((output, i) => (
            <NodeOutputRow
              key={output.id}
              id={output.id}
              name={output.name}
              value={defaultVariableValueMap[output.id]}
              onClick={() => {
                setDetailPanelContentType(
                  DetailPanelContentType.ChatGPTMessageConfig
                );
                setDetailPanelSelectedNodeId(nodeId);
              }}
            />
          ))}
        </Section>
      </NodeBox>
      {nodeConfig.outputs.map((output, i) => (
        <OutputHandle
          key={output.id}
          type="source"
          id={output.id}
          position={Position.Right}
          style={{
            bottom: calculateOutputHandleBottom(
              nodeConfig.outputs.length - 1 - i
            ),
          }}
        />
      ))}
    </>
  );
}
