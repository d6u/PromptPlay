import FormControl from '@mui/joy/FormControl';
import FormHelperText from '@mui/joy/FormHelperText';
import FormLabel from '@mui/joy/FormLabel';
import Input from '@mui/joy/Input';
import { NodeID, V3HuggingFaceInferenceNodeConfig } from 'flow-models';
import { useContext, useMemo, useState } from 'react';
import { useNodeId } from 'reactflow';
import RouteFlowContext from 'state-flow/context/FlowRouteContext';
import { useFlowStore } from 'state-flow/context/FlowStoreContext';
import {
  LocalStorageState,
  SpaceState,
  useLocalStorageStore,
  useSpaceStore,
} from '../../state/appState';
import ReactFlowNode from '../ReactFlowNode';
import NodeBoxHelperTextContainer from '../node-box/NodeBoxHelperTextContainer';
import NodeBoxIncomingVariableReadonly from '../node-box/NodeBoxIncomingVariableReadonly';
import NodeBoxSection from '../node-box/NodeBoxSection';

const persistSelector = (state: LocalStorageState) => ({
  huggingFaceApiToken: state.huggingFaceApiToken,
  setHuggingFaceApiToken: state.setHuggingFaceApiToken,
});

const selector = (state: SpaceState) => ({
  missingHuggingFaceApiToken: state.missingHuggingFaceApiToken,
  setMissingHuggingFaceApiToken: state.setMissingHuggingFaceApiToken,
});

export default function HuggingFaceInferenceNode() {
  const { isCurrentUserOwner } = useContext(RouteFlowContext);

  const { huggingFaceApiToken, setHuggingFaceApiToken } =
    useLocalStorageStore(persistSelector);
  const { missingHuggingFaceApiToken, setMissingHuggingFaceApiToken } =
    useSpaceStore(selector);

  const nodeId = useNodeId() as NodeID;

  const nodeConfigs = useFlowStore((s) => s.nodeConfigsDict);
  const updateNodeConfig = useFlowStore((s) => s.updateNodeConfig);

  const nodeConfig = useMemo(
    () => nodeConfigs[nodeId] as V3HuggingFaceInferenceNodeConfig | undefined,
    [nodeConfigs, nodeId],
  );

  // It's OK to force unwrap here because nodeConfig will be undefined only
  // when Node is being deleted.
  const [model, setModel] = useState(() => nodeConfig!.model);

  if (!nodeConfig) {
    return null;
  }

  return (
    <ReactFlowNode
      isNodeConfigReadOnly={!isCurrentUserOwner}
      canAddVariable={false}
      destConnectorReadOnlyConfigs={[true]}
      destConnectorHelpMessages={[
        <>
          Check Hugging Face's free{' '}
          <a
            href="https://huggingface.co/docs/api-inference/quicktour"
            target="_blank"
            rel="noreferrer"
          >
            Inference API documentation
          </a>{' '}
          for more information about the <code>parameters</code> input.
          Depending on the model you choose, you need to specify different
          parameters.
        </>,
      ]}
    >
      {isCurrentUserOwner && (
        <NodeBoxSection>
          <FormControl>
            <FormLabel>API Token</FormLabel>
            <Input
              type="password"
              color={missingHuggingFaceApiToken ? 'danger' : 'neutral'}
              value={huggingFaceApiToken ?? ''}
              onChange={(e) => {
                const value = e.target.value.trim();
                setHuggingFaceApiToken(value.length ? value : null);
                setMissingHuggingFaceApiToken(false);
              }}
            />
            {missingHuggingFaceApiToken && (
              <NodeBoxHelperTextContainer color="danger">
                Must provide a Hugging Face API token.
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
          <FormLabel>Model</FormLabel>
          {isCurrentUserOwner ? (
            <Input
              value={model}
              onChange={(e) => {
                setModel(e.target.value);
              }}
              onKeyUp={(e) => {
                if (e.key === 'Enter') {
                  updateNodeConfig(nodeId, { model });
                }
              }}
              onBlur={() => {
                updateNodeConfig(nodeId, { model });
              }}
            />
          ) : (
            <NodeBoxIncomingVariableReadonly value={model} />
          )}
        </FormControl>
      </NodeBoxSection>
    </ReactFlowNode>
  );
}
