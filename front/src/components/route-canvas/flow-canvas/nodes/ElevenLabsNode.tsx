import FormControl from '@mui/joy/FormControl';
import FormHelperText from '@mui/joy/FormHelperText';
import FormLabel from '@mui/joy/FormLabel';
import Input from '@mui/joy/Input';
import { NodeID, NodeType, V3ElevenLabsNodeConfig } from 'flow-models';
import { useContext, useMemo, useState } from 'react';
import { useNodeId } from 'reactflow';
import {
  LocalStorageState,
  SpaceState,
  useLocalStorageStore,
  useSpaceStore,
} from '../../../../state/appState';
import ReactFlowNode from '../../../common-react-flow/ReactFlowNode';
import NodeBoxHelperTextContainer from '../../../common-react-flow/node-box/NodeBoxHelperTextContainer';
import NodeBoxSection from '../../../common-react-flow/node-box/NodeBoxSection';
import InputReadonly from '../../../route-flow/common/InputReadonly';
import RouteFlowContext from '../../../route-flow/common/RouteFlowContext';
import { useFlowStore } from '../../../route-flow/store/FlowStoreContext';

const persistSelector = (state: LocalStorageState) => ({
  elevenLabsApiKey: state.elevenLabsApiKey,
  setElevenLabsApiKey: state.setElevenLabsApiKey,
});

const selector = (state: SpaceState) => ({
  missingElevenLabsApiKey: state.missingElevenLabsApiKey,
  setMissingElevenLabsApiKey: state.setMissingElevenLabsApiKey,
});

export default function ElevenLabsNode() {
  const { isCurrentUserOwner } = useContext(RouteFlowContext);

  const { elevenLabsApiKey, setElevenLabsApiKey } =
    useLocalStorageStore(persistSelector);
  const { missingElevenLabsApiKey, setMissingElevenLabsApiKey } =
    useSpaceStore(selector);

  // ANCHOR: ReactFlow
  const nodeId = useNodeId() as NodeID;

  const nodeConfigs = useFlowStore((s) => s.nodeConfigsDict);
  const updateNodeConfig = useFlowStore((s) => s.updateNodeConfig);

  const nodeConfig = useMemo(
    () => nodeConfigs[nodeId] as V3ElevenLabsNodeConfig | undefined,
    [nodeConfigs, nodeId],
  );

  // It's OK to force unwrap here because nodeConfig will be undefined only
  // when Node is being deleted.
  const [voiceId, setVoiceId] = useState(() => nodeConfig!.voiceId);

  if (!nodeConfig) {
    return null;
  }

  return (
    <ReactFlowNode
      nodeType={NodeType.ElevenLabs}
      nodeTitle="Eleven Labs Text to Speech"
      allowAddVariable={false}
      destConnectorReadOnlyConfigs={[true]}
      destConnectorHelpMessages={[
        <>
          Check Elevent Labs's{' '}
          <a
            href="https://docs.elevenlabs.io/api-reference/text-to-speech"
            target="_blank"
            rel="noreferrer"
          >
            Text to Speech API Reference
          </a>{' '}
          for more information.
        </>,
      ]}
    >
      {isCurrentUserOwner && (
        <NodeBoxSection>
          <FormControl>
            <FormLabel>API Key</FormLabel>
            <Input
              type="password"
              color={missingElevenLabsApiKey ? 'danger' : 'neutral'}
              value={elevenLabsApiKey ?? ''}
              onChange={(e) => {
                const value = e.target.value.trim();
                setElevenLabsApiKey(value.length ? value : null);
                setMissingElevenLabsApiKey(false);
              }}
            />
            {missingElevenLabsApiKey && (
              <NodeBoxHelperTextContainer color="danger">
                Must provide a Eleven Labs API key.
              </NodeBoxHelperTextContainer>
            )}
            <FormHelperText>
              This is stored in your browser's local storage. Never uploaded.
            </FormHelperText>
          </FormControl>
        </NodeBoxSection>
      )}
      <NodeBoxSection>
        <FormControl>
          <FormLabel>Voice ID</FormLabel>
          {isCurrentUserOwner ? (
            <Input
              value={voiceId}
              onChange={(e) => {
                setVoiceId(e.target.value);
              }}
              onKeyUp={(e) => {
                if (e.key === 'Enter') {
                  updateNodeConfig(nodeId, { voiceId });
                }
              }}
              onBlur={() => {
                updateNodeConfig(nodeId, { voiceId });
              }}
            />
          ) : (
            <InputReadonly value={voiceId} />
          )}
        </FormControl>
      </NodeBoxSection>
    </ReactFlowNode>
  );
}
