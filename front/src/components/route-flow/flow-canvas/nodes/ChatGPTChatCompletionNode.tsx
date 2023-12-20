import { Checkbox } from '@mui/joy';
import FormControl from '@mui/joy/FormControl';
import FormHelperText from '@mui/joy/FormHelperText';
import FormLabel from '@mui/joy/FormLabel';
import Input from '@mui/joy/Input';
import Option from '@mui/joy/Option';
import Select from '@mui/joy/Select';
import {
  ChatGPTChatCompletionResponseFormatType,
  NodeID,
  NodeType,
  OpenAIChatModel,
  V3ChatGPTChatCompletionNodeConfig,
  VariableType,
} from 'flow-models';
import { NEW_LINE_SYMBOL } from 'integrations/openai';
import { useContext, useEffect, useMemo, useState } from 'react';
import { Position, useNodeId } from 'reactflow';
import { useStore } from 'zustand';
import {
  LocalStorageState,
  SpaceState,
  useLocalStorageStore,
  useSpaceStore,
} from '../../../../state/appState';
import FlowContext from '../../FlowContext';
import InputReadonly from '../../common/InputReadonly';
import { useStoreFromFlowStoreContext } from '../../store/FlowStoreContext';
import { selectVariables } from '../../store/state-utils';
import HeaderSection from './node-common/HeaderSection';
import HelperTextContainer from './node-common/HelperTextContainer';
import NodeBox, { NodeState } from './node-common/NodeBox';
import NodeInputModifyRow from './node-common/NodeInputModifyRow';
import NodeOutputRow from './node-common/NodeOutputRow';
import { InputHandle, OutputHandle, Section } from './node-common/node-common';
import {
  calculateInputHandleTop,
  calculateOutputHandleBottom,
} from './node-common/utils';

const persistSelector = (state: LocalStorageState) => ({
  openAiApiKey: state.openAiApiKey,
  setOpenAiApiKey: state.setOpenAiApiKey,
});

const selector = (state: SpaceState) => ({
  missingOpenAiApiKey: state.missingOpenAiApiKey,
  setMissingOpenAiApiKey: state.setMissingOpenAiApiKey,
});

export default function ChatGPTChatCompletionNode() {
  const nodeId = useNodeId() as NodeID;

  const { isCurrentUserOwner } = useContext(FlowContext);
  const flowStore = useStoreFromFlowStoreContext();

  const nodeConfigsDict = useStore(flowStore, (s) => s.nodeConfigsDict);
  const variablesDict = useStore(flowStore, (s) => s.variablesDict);
  const updateNodeConfig = useStore(flowStore, (s) => s.updateNodeConfig);
  const removeNode = useStore(flowStore, (s) => s.removeNode);
  const nodeMetadataDict = useStore(flowStore, (s) => s.nodeMetadataDict);
  const defaultVariableValueMap = useStore(flowStore, (s) =>
    s.getDefaultVariableValueLookUpDict(),
  );

  const { openAiApiKey, setOpenAiApiKey } =
    useLocalStorageStore(persistSelector);

  const { missingOpenAiApiKey, setMissingOpenAiApiKey } =
    useSpaceStore(selector);

  const nodeConfig = useMemo(
    () =>
      nodeConfigsDict[nodeId] as V3ChatGPTChatCompletionNodeConfig | undefined,
    [nodeConfigsDict, nodeId],
  );

  const augment = useMemo(
    () => nodeMetadataDict[nodeId],
    [nodeMetadataDict, nodeId],
  );

  // It's OK to force unwrap here because nodeConfig will be undefined only
  // when Node is being deleted.
  const [model, setModel] = useState(() => nodeConfig!.model);
  const [stop, setStop] = useState(() => nodeConfig!.stop);

  // SECTION: Temperature Field

  const [temperature, setTemperature] = useState<string>(
    () => nodeConfig?.temperature.toString() ?? '',
  );

  useEffect(() => {
    if (nodeConfig?.temperature != null) {
      setTemperature(nodeConfig.temperature.toString());
    } else {
      setTemperature('');
    }
  }, [nodeConfig?.temperature]);

  // !SECTION

  // SECTION: Seed Field

  const [seed, setSeed] = useState<string>(
    () => nodeConfig?.seed?.toString() ?? '',
  );

  useEffect(() => {
    if (nodeConfig?.seed != null) {
      setSeed(nodeConfig.seed.toString());
    } else {
      setSeed('');
    }
  }, [nodeConfig?.seed]);

  // !SECTION

  if (!nodeConfig) {
    return null;
  }

  const inputVariables = selectVariables(
    nodeId,
    VariableType.NodeInput,
    variablesDict,
  );

  const outputVariables = selectVariables(
    nodeId,
    VariableType.NodeOutput,
    variablesDict,
  );

  return (
    <>
      <InputHandle
        type="target"
        id={inputVariables[0].id}
        position={Position.Left}
        style={{ top: calculateInputHandleTop(-1) }}
      />
      <NodeBox
        nodeType={NodeType.ChatGPTChatCompletionNode}
        state={
          augment?.isRunning
            ? NodeState.Running
            : augment?.hasError
              ? NodeState.Error
              : NodeState.Idle
        }
      >
        <HeaderSection
          isCurrentUserOwner={isCurrentUserOwner}
          title="ChatGPT Chat Completion"
          onClickRemove={() => {
            removeNode(nodeId);
          }}
        />
        <Section>
          <NodeInputModifyRow
            key={inputVariables[0].id}
            name={inputVariables[0].name}
            isReadOnly
          />
        </Section>
        <Section>
          <HelperTextContainer>
            Check{' '}
            <a
              href="https://platform.openai.com/docs/api-reference/chat/create#messages"
              target="_blank"
              rel="noreferrer"
            >
              OpenAI API reference
            </a>{' '}
            for more information about the <code>messages</code> parameter. The
            generated assistant message will be appended to the list and output
            as the <code>messages</code> output.
          </HelperTextContainer>
        </Section>
        {isCurrentUserOwner && (
          <Section>
            <FormControl>
              <FormLabel>OpenAI API key</FormLabel>
              <Input
                type="password"
                color={missingOpenAiApiKey ? 'danger' : 'neutral'}
                value={openAiApiKey ?? ''}
                onChange={(e) => {
                  const value = e.target.value.trim();
                  setOpenAiApiKey(value.length ? value : null);
                  setMissingOpenAiApiKey(false);
                }}
              />
              {missingOpenAiApiKey && (
                <HelperTextContainer color="danger">
                  Must specify an Open AI API key here.
                </HelperTextContainer>
              )}
              <FormHelperText>
                This is stored in your browser's local storage. Never uploaded.
              </FormHelperText>
            </FormControl>
          </Section>
        )}
        <Section>
          <FormControl>
            <FormLabel>Model</FormLabel>
            <Select
              disabled={!isCurrentUserOwner}
              value={model}
              onChange={(_, value) => {
                const newModel = value as OpenAIChatModel;
                setModel(newModel);
                updateNodeConfig(nodeId, { model: newModel });
              }}
            >
              {Object.values(OpenAIChatModel).map((model) => (
                <Option key={model} value={model}>
                  {model}
                </Option>
              ))}
            </Select>
          </FormControl>
        </Section>
        <Section>
          <FormControl>
            <FormLabel>Temperature</FormLabel>
            {isCurrentUserOwner ? (
              <Input
                type="number"
                slotProps={{ input: { min: 0, max: 2, step: 0.1 } }}
                value={temperature}
                onChange={(event) => {
                  setTemperature(event.target.value);
                }}
                onKeyUp={(event) => {
                  if (event.key === 'Enter') {
                    let temperatureFloat: number = 1;
                    if (temperature !== '') {
                      temperatureFloat = Number(temperature);
                    } else {
                      // We don't allow empty string for temperature, i.e.
                      // temperature must always be provided.
                      //
                      // Although we are already setting temperature to 1 when
                      // input value is an empty string, the useEffect above
                      // might not update local temperature state, because if
                      // the initial temperature is 1, the useEffect will not
                      // be triggered.
                      setTemperature(temperatureFloat.toString());
                    }
                    updateNodeConfig(nodeId, { temperature: temperatureFloat });
                  }
                }}
                onBlur={() => {
                  let temperatureFloat: number = 1;
                  if (temperature !== '') {
                    temperatureFloat = Number(temperature);
                  } else {
                    setTemperature(temperatureFloat.toString());
                  }
                  updateNodeConfig(nodeId, { temperature: temperatureFloat });
                }}
              />
            ) : (
              <InputReadonly type="number" value={temperature} />
            )}
          </FormControl>
        </Section>
        <Section>
          <FormControl>
            <FormLabel>Seed (Optional, Beta)</FormLabel>
            {isCurrentUserOwner ? (
              <Input
                type="number"
                slotProps={{ input: { step: 1 } }}
                value={seed}
                onChange={(event) => {
                  setSeed(event.target.value);
                }}
                onKeyUp={(event) => {
                  if (event.key === 'Enter') {
                    let seedInt: number | null = null;
                    if (seed !== '') {
                      seedInt = Math.trunc(Number(seed));
                    }
                    updateNodeConfig(nodeId, { seed: seedInt });
                  }
                }}
                onBlur={() => {
                  let seedInt: number | null = null;
                  if (seed !== '') {
                    seedInt = Math.trunc(Number(seed));
                  }
                  updateNodeConfig(nodeId, { seed: seedInt });
                }}
              />
            ) : (
              <InputReadonly type="number" value={temperature} />
            )}
          </FormControl>
        </Section>
        <Section>
          <FormControl>
            <FormLabel>Use JSON Response Format</FormLabel>
            <Checkbox
              disabled={!isCurrentUserOwner}
              size="sm"
              variant="outlined"
              checked={nodeConfig.responseFormatType != null}
              onChange={(event) => {
                if (!isCurrentUserOwner) {
                  return;
                }

                if (event.target.checked) {
                  updateNodeConfig(nodeId, {
                    responseFormatType:
                      ChatGPTChatCompletionResponseFormatType.JsonObject,
                  });
                } else {
                  updateNodeConfig(nodeId, { responseFormatType: null });
                }
              }}
            />
          </FormControl>
        </Section>
        <Section>
          <FormControl>
            <FormLabel>Stop sequence</FormLabel>
            {isCurrentUserOwner ? (
              <Input
                placeholder="Stop sequence"
                value={
                  stop.length ? stop[0].replace(/\n/g, NEW_LINE_SYMBOL) : ''
                }
                onKeyDown={(event) => {
                  if (event.shiftKey && event.key === 'Enter') {
                    event.preventDefault();
                    setStop((stop) =>
                      stop.length ? [stop[0] + '\n'] : ['\n'],
                    );
                  }
                }}
                onChange={(e) => {
                  const v = e.target.value;

                  if (!v) {
                    setStop([]);
                    return;
                  }

                  setStop([v.replace(RegExp(NEW_LINE_SYMBOL, 'g'), '\n')]);
                }}
                onKeyUp={(e) => {
                  if (e.key === 'Enter') {
                    updateNodeConfig(nodeId, { stop });
                  }
                }}
                onBlur={() => {
                  updateNodeConfig(nodeId, { stop });
                }}
              />
            ) : (
              <InputReadonly
                value={
                  stop.length ? stop[0].replace(/\n/g, NEW_LINE_SYMBOL) : ''
                }
              />
            )}
            <FormHelperText>
              <div>
                Use <code>SHIFT</code> + <code>ENTER</code> to enter a new line
                character. (Visually represented by{' '}
                <code>"{NEW_LINE_SYMBOL}"</code>.)
              </div>
            </FormHelperText>
          </FormControl>
        </Section>
        <Section>
          {outputVariables.map((output, i) => (
            <NodeOutputRow
              key={output.id}
              id={output.id}
              name={output.name}
              value={defaultVariableValueMap[output.id]}
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
