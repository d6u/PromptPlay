import { FormControl, FormHelperText, FormLabel, Input } from '@mui/joy';
import {
  GlobalFieldDefinition,
  NodeType,
  TextFieldDefinition,
} from 'flow-models';
import { useCallback, useEffect, useState } from 'react';
import { useLocalStorageStore } from 'state-root/local-storage-state';
import { useNodeFieldFeedbackStore } from 'state-root/node-field-feedback-state';
import invariant from 'tiny-invariant';
import NodeBoxHelperTextContainer from '../node-box/NodeBoxHelperTextContainer';
import NodeBoxSection from '../node-box/NodeBoxSection';

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

  const getGlobalField =
    useLocalStorageStore.use.getLocalAccountLevelNodeFieldValue();
  const setGlobalField =
    useLocalStorageStore.use.setLocalAccountLevelNodeFieldValue();

  const globalFieldValue = getGlobalField(
    props.nodeType,
    globalFieldDefinitionKey,
  );

  const [localFieldValue, setLocalFieldValue] = useState<string>(() => {
    return globalFieldValue ?? '';
  });

  useEffect(() => {
    setLocalFieldValue(globalFieldValue ?? '');
  }, [globalFieldValue]);

  const onSaveCallback = useCallback(() => {
    setGlobalField(props.nodeType, globalFieldDefinitionKey, localFieldValue);
  }, [
    globalFieldDefinitionKey,
    localFieldValue,
    props.nodeType,
    setGlobalField,
  ]);

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
