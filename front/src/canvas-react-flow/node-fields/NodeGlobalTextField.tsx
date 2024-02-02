import { FormControl, FormHelperText, FormLabel, Input } from '@mui/joy';
import NodeBoxHelperTextContainer from 'canvas-react-flow/node-box/NodeBoxHelperTextContainer';
import NodeBoxSection from 'canvas-react-flow/node-box/NodeBoxSection';
import {
  GlobalFieldDefinition,
  NodeType,
  TextFieldDefinition,
} from 'flow-models';
import { useCallback, useEffect, useState } from 'react';
import invariant from 'tiny-invariant';
import { useLocalStorageStore } from '../../state/appState';
import { useNodeFieldFeedbackStore } from '../../state/node-field-feedback-state';

type Props = {
  nodeId: string;
  nodeType: NodeType;
  fieldKey: string;
  fieldDefinition: TextFieldDefinition;
  globalFieldDefinition: GlobalFieldDefinition;
  isNodeConfigReadOnly: boolean;
};

function NodeGlobalTextField(props: Props) {
  const fd = props.fieldDefinition;
  const gfd = props.globalFieldDefinition;

  const globalFieldDefinitionKey = fd.globalFieldDefinitionKey;

  invariant(globalFieldDefinitionKey, 'globalFieldDefinitionKey is not null');

  const globalFieldStorageKey = `${props.nodeType}:${globalFieldDefinitionKey}`;

  const getGlobalField = useLocalStorageStore.use.getGlobalField();
  const setGlobalField = useLocalStorageStore.use.setGlobalField();

  const globalFieldValue = getGlobalField(globalFieldStorageKey) as
    | string
    | undefined;

  const [localFieldValue, setLocalFieldValue] = useState<string>(() => {
    return globalFieldValue ?? '';
  });

  useEffect(() => {
    setLocalFieldValue(globalFieldValue ?? '');
  }, [globalFieldValue]);

  const onSaveCallback = useCallback(() => {
    setGlobalField(globalFieldStorageKey, localFieldValue);
  }, [globalFieldStorageKey, localFieldValue, setGlobalField]);

  const getFieldFeedbacks = useNodeFieldFeedbackStore.use.getFieldFeedbacks();

  // NOTE: Global fields are hidden in the UI if we are in read-only mode
  if (props.isNodeConfigReadOnly) {
    return null;
  }

  const feedbackKey = `${props.nodeId}:${props.fieldKey}`;
  const feedbacks = getFieldFeedbacks(feedbackKey);

  return (
    <NodeBoxSection>
      <FormControl>
        <FormLabel>{fd.label}</FormLabel>
        <Input
          type={gfd.isSecret ? 'password' : 'text'}
          color={feedbacks.length ? 'danger' : 'neutral'}
          placeholder={fd.placeholder}
          value={localFieldValue}
          onChange={(e) => {
            setLocalFieldValue(e.target.value);
          }}
          onKeyUp={(e) => {
            if (e.key === 'Enter') {
              onSaveCallback();
            }
          }}
          onBlur={onSaveCallback}
        />
        {feedbacks.length > 0 &&
          feedbacks.map((feedback, i) => {
            return (
              <NodeBoxHelperTextContainer key={i} color="danger">
                {feedback}
              </NodeBoxHelperTextContainer>
            );
          })}
        {fd.helperMessage && (
          <FormHelperText>{fd.helperMessage}</FormHelperText>
        )}
      </FormControl>
    </NodeBoxSection>
  );
}

export default NodeGlobalTextField;
