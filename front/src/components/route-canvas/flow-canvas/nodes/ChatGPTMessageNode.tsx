import { A } from '@mobily/ts-belt';
import FormControl from '@mui/joy/FormControl';
import FormHelperText from '@mui/joy/FormHelperText';
import FormLabel from '@mui/joy/FormLabel';
import IconButton from '@mui/joy/IconButton';
import Radio from '@mui/joy/Radio';
import RadioGroup from '@mui/joy/RadioGroup';
import Textarea from '@mui/joy/Textarea';
import {
  ConditionTarget,
  ConnectorID,
  ConnectorType,
  NodeID,
  NodeType,
  V3ChatGPTMessageNodeConfig,
} from 'flow-models';
import { ChatGPTMessageRole } from 'integrations/openai';
import { ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { Position, useNodeId, useUpdateNodeInternals } from 'reactflow';
import invariant from 'tiny-invariant';
import { useStore } from 'zustand';
import RouteFlowContext from '../../../route-flow/common/RouteFlowContext';
import TextareaReadonly from '../../../route-flow/common/TextareaReadonly';
import {
  CopyIcon,
  LabelWithIconContainer,
} from '../../../route-flow/common/flow-common';
import { useStoreFromFlowStoreContext } from '../../../route-flow/store/FlowStoreContext';
import {
  selectConditionTarget,
  selectVariables,
} from '../../../route-flow/store/state-utils';
import { DetailPanelContentType } from '../../../route-flow/store/store-flow-state-types';
import AddVariableButton from './node-common/AddVariableButton';
import HeaderSection from './node-common/HeaderSection';
import NodeBox from './node-common/NodeBox';
import NodeInputModifyRow from './node-common/NodeInputModifyRow';
import NodeOutputRow from './node-common/NodeOutputRow';
import {
  ConditionTargetHandle,
  InputHandle,
  OutputHandle,
  Section,
  SmallSection,
  StyledIconGear,
} from './node-common/node-common';
import {
  calculateInputHandleTopV2,
  calculateOutputHandleBottom,
} from './node-common/utils';

export default function ChatGPTMessageNode() {
  const nodeId = useNodeId() as NodeID;

  const { isCurrentUserOwner } = useContext(RouteFlowContext);

  const flowStore = useStoreFromFlowStoreContext();

  const variablesDict = useStore(flowStore, (s) => s.variablesDict);

  const conditionTarget = useMemo(() => {
    return selectConditionTarget(nodeId, variablesDict);
  }, [nodeId, variablesDict]);

  const inputs = useMemo(() => {
    const inputArray = selectVariables(
      nodeId,
      ConnectorType.NodeInput,
      variablesDict,
    );

    const messages: DestConnector = {
      id: inputArray[0].id,
      name: inputArray[0].name,
      isReadOnly: true,
      helperMessage: (
        <>
          <code>messages</code> is a list of ChatGPT message. It's default to an
          empty list if unspecified. The current message will be appended to the
          list and output as the <code>messages</code> output.
        </>
      ),
    };

    const rest = inputArray.slice(1).map<DestConnector>((input, index) => {
      return {
        id: input.id,
        name: input.name,
        isReadOnly: !isCurrentUserOwner,
      };
    });

    return [messages].concat(rest);
  }, [isCurrentUserOwner, nodeId, variablesDict]);

  return (
    <Inner
      nodeTitle="ChatGPT Message"
      destConnectors={inputs}
      conditionTarget={conditionTarget}
    />
  );
}

type DestConnector = {
  id: string;
  name: string;
  isReadOnly: boolean;
  helperMessage?: ReactNode;
};

type Props = {
  nodeTitle: string;
  destConnectors: DestConnector[];
  conditionTarget?: ConditionTarget | null;
};

function Inner(props: Props) {
  const nodeId = useNodeId() as NodeID;
  const updateNodeInternals = useUpdateNodeInternals();

  const { isCurrentUserOwner } = useContext(RouteFlowContext);
  const flowStore = useStoreFromFlowStoreContext();

  // SECTION: Select state from store

  const nodeConfigsDict = useStore(flowStore, (s) => s.nodeConfigsDict);
  const variablesDict = useStore(flowStore, (s) => s.variablesDict);
  const updateNodeConfig = useStore(flowStore, (s) => s.updateNodeConfig);
  const removeNode = useStore(flowStore, (s) => s.removeNode);
  const addVariable = useStore(flowStore, (s) => s.addVariable);
  const updateVariable = useStore(flowStore, (s) => s.updateVariable);
  const removeVariable = useStore(flowStore, (s) => s.removeVariable);
  const setDetailPanelContentType = useStore(
    flowStore,
    (s) => s.setDetailPanelContentType,
  );
  const setDetailPanelSelectedNodeId = useStore(
    flowStore,
    (s) => s.setDetailPanelSelectedNodeId,
  );
  const defaultVariableValueMap = useStore(flowStore, (s) =>
    s.getDefaultVariableValueLookUpDict(),
  );

  // !SECTION

  const outputVariables = selectVariables(
    nodeId,
    ConnectorType.NodeOutput,
    variablesDict,
  );

  const nodeConfig = useMemo(() => {
    return nodeConfigsDict[nodeId] as V3ChatGPTMessageNodeConfig | undefined;
  }, [nodeConfigsDict, nodeId]);

  // It's OK to force unwrap here because nodeConfig will be undefined only
  // when Node is being deleted.
  const [content, setContent] = useState(() => nodeConfig!.content);
  const [role, setRole] = useState(() => nodeConfig!.role);

  // SECTION: Manage height of each variable input box
  const [destConnectorInputHeightArr, setDestConnectorInputHeightArr] =
    useState<number[]>(() => {
      return A.make(props.destConnectors.length, 0);
    });

  useEffect(() => {
    if (props.destConnectors.length > destConnectorInputHeightArr.length) {
      // NOTE: Increase the length of destConnectorInputHeightArr when needed
      setDestConnectorInputHeightArr((state) => {
        return state.concat(
          A.make(props.destConnectors.length - state.length, 0),
        );
      });
    }
  }, [props.destConnectors.length, destConnectorInputHeightArr.length]);
  // !SECTION

  useEffect(() => {
    updateNodeInternals(nodeId);
  }, [destConnectorInputHeightArr, nodeId, updateNodeInternals]);

  useEffect(() => {
    setRole(nodeConfig?.role ?? ChatGPTMessageRole.user);
  }, [nodeConfig]);

  useEffect(() => {
    setContent(() => nodeConfig!.content ?? '');
  }, [nodeConfig]);

  if (!nodeConfig) {
    // NOTE: This will happen when the node is removed in store, but not yet
    // reflected in react-flow store.
    return null;
  }

  invariant(nodeConfig.type === NodeType.ChatGPTMessageNode);

  return (
    <>
      {props.conditionTarget && (
        <ConditionTargetHandle controlId={props.conditionTarget.id} />
      )}
      {props.destConnectors.map((input, i) => {
        return (
          <InputHandle
            key={i}
            type="target"
            id={input.id}
            position={Position.Left}
            style={{
              top: calculateInputHandleTopV2(i, destConnectorInputHeightArr),
            }}
          />
        );
      })}
      <NodeBox nodeType={NodeType.ChatGPTMessageNode}>
        <HeaderSection
          isCurrentUserOwner={isCurrentUserOwner}
          title={props.nodeTitle}
          onClickRemove={() => {
            removeNode(nodeId);
          }}
        />
        {isCurrentUserOwner && (
          <SmallSection>
            <AddVariableButton
              onClick={() => {
                addVariable(
                  nodeId,
                  ConnectorType.NodeInput,
                  props.destConnectors.length,
                );
                updateNodeInternals(nodeId);
              }}
            />
          </SmallSection>
        )}
        <Section>
          {props.destConnectors.map((input, i) => {
            return (
              <NodeInputModifyRow
                key={input.id}
                name={input.name}
                isReadOnly={input.isReadOnly}
                helperMessage={input.helperMessage}
                onConfirmNameChange={(name) => {
                  if (!input.isReadOnly) {
                    updateVariable(input.id as ConnectorID, { name });
                  }
                }}
                onRemove={() => {
                  if (!input.isReadOnly) {
                    removeVariable(input.id as ConnectorID);
                    updateNodeInternals(nodeId);
                  }
                }}
                onHeightChange={(height: number) => {
                  setDestConnectorInputHeightArr((arr) => {
                    return A.updateAt(arr, i, () => height);
                  });
                }}
              />
            );
          })}
        </Section>
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
            <StyledIconGear />
          </IconButton>
        </Section>
        <Section>
          {outputVariables.map((output, i) => (
            <NodeOutputRow
              key={output.id}
              id={output.id}
              name={output.name}
              value={defaultVariableValueMap[output.id]}
              onClick={() => {
                setDetailPanelContentType(
                  DetailPanelContentType.ChatGPTMessageConfig,
                );
                setDetailPanelSelectedNodeId(nodeId);
              }}
            />
          ))}
        </Section>
      </NodeBox>
      {outputVariables.map((output, i) => (
        <OutputHandle
          key={output.id}
          type="source"
          id={output.id}
          position={Position.Right}
          style={{
            bottom: calculateOutputHandleBottom(outputVariables.length - 1 - i),
          }}
        />
      ))}
    </>
  );
}
