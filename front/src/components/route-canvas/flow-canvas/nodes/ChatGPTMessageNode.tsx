import FormControl from '@mui/joy/FormControl';
import FormHelperText from '@mui/joy/FormHelperText';
import FormLabel from '@mui/joy/FormLabel';
import IconButton from '@mui/joy/IconButton';
import Radio from '@mui/joy/Radio';
import RadioGroup from '@mui/joy/RadioGroup';
import Textarea from '@mui/joy/Textarea';
import { ConnectorType, NodeID, V3ChatGPTMessageNodeConfig } from 'flow-models';
import { ChatGPTMessageRole } from 'integrations/openai';
import { useContext, useEffect, useMemo, useState } from 'react';
import { useNodeId } from 'reactflow';
import RouteFlowContext from '../../../route-flow/common/RouteFlowContext';
import TextareaReadonly from '../../../route-flow/common/TextareaReadonly';
import {
  CopyIcon,
  LabelWithIconContainer,
} from '../../../route-flow/common/flow-common';
import { useFlowStore } from '../../../route-flow/store/FlowStoreContext';
import {
  selectConditionTarget,
  selectVariables,
} from '../../../route-flow/store/state-utils';
import { DetailPanelContentType } from '../../../route-flow/store/store-flow-state-types';
import ReactFlowNode, {
  DestConnector,
  SrcConnector,
} from '../nodeV2/ReactFlowNode';
import { Section, StyledIconGear } from './node-common/node-common';

export default function ChatGPTMessageNode() {
  // SECTION: Generic properties

  const nodeId = useNodeId() as NodeID;

  const { isCurrentUserOwner } = useContext(RouteFlowContext);

  const variablesDict = useFlowStore((s) => s.variablesDict);
  const defaultVariableValueMap = useFlowStore((s) =>
    s.getDefaultVariableValueLookUpDict(),
  );

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

  const outputs = useMemo(() => {
    const outputVariables = selectVariables(
      nodeId,
      ConnectorType.NodeOutput,
      variablesDict,
    );

    return outputVariables.map<SrcConnector>((output) => {
      return {
        id: output.id,
        name: output.name,
        value: defaultVariableValueMap[output.id],
      };
    });
  }, [defaultVariableValueMap, nodeId, variablesDict]);

  // !SECTION

  const nodeConfigsDict = useFlowStore((s) => s.nodeConfigsDict);
  const updateNodeConfig = useFlowStore((s) => s.updateNodeConfig);
  const setDetailPanelContentType = useFlowStore(
    (s) => s.setDetailPanelContentType,
  );
  const setDetailPanelSelectedNodeId = useFlowStore(
    (s) => s.setDetailPanelSelectedNodeId,
  );

  const nodeConfig = useMemo(() => {
    return nodeConfigsDict[nodeId] as V3ChatGPTMessageNodeConfig | undefined;
  }, [nodeConfigsDict, nodeId]);

  // It's OK to force unwrap here because nodeConfig will be undefined only
  // when Node is being deleted.
  const [content, setContent] = useState(() => nodeConfig!.content);
  const [role, setRole] = useState(() => nodeConfig!.role);

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

  return (
    <ReactFlowNode
      nodeTitle="ChatGPT Message"
      conditionTarget={conditionTarget}
      destConnectors={inputs}
      srcConnectors={outputs}
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
          <StyledIconGear />
        </IconButton>
      </Section>
    </ReactFlowNode>
  );
}
