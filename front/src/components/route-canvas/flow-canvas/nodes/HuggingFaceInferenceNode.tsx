import FormControl from '@mui/joy/FormControl';
import FormHelperText from '@mui/joy/FormHelperText';
import FormLabel from '@mui/joy/FormLabel';
import Input from '@mui/joy/Input';
import {
  NodeID,
  NodeType,
  V3HuggingFaceInferenceNodeConfig,
} from 'flow-models';
import { useContext, useMemo, useState } from 'react';
import { useNodeId } from 'reactflow';
import {
  LocalStorageState,
  SpaceState,
  useLocalStorageStore,
  useSpaceStore,
} from '../../../../state/appState';
import InputReadonly from '../../../route-flow/common/InputReadonly';
import RouteFlowContext from '../../../route-flow/common/RouteFlowContext';
import { useFlowStore } from '../../../route-flow/store/FlowStoreContext';
import ReactFlowNode from '../nodeV2/ReactFlowNode';
import HelperTextContainer from './node-common/HelperTextContainer';
import { Section } from './node-common/node-common';

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
      nodeType={NodeType.HuggingFaceInference}
      nodeTitle="Hugging Face Inference"
      allowAddVariable={false}
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
        <Section>
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
              <HelperTextContainer color="danger">
                Must provide a Hugging Face API token.
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
            <InputReadonly value={model} />
          )}
        </FormControl>
      </Section>
    </ReactFlowNode>
  );
}
