import { FormControl, FormHelperText, FormLabel, Input } from '@mui/joy';
import { useCallback, useEffect, useState } from 'react';

import { NodeAccountLevelTextFieldDefinition, NodeType } from 'flow-models';

import { useLocalStorageStore } from 'state-root/local-storage-state';
import { useNodeFieldFeedbackStore } from 'state-root/node-field-feedback-state';

import NodeBoxHelperTextContainer from '../node-box/NodeBoxHelperTextContainer';
import NodeBoxSection from '../node-box/NodeBoxSection';

type Props = {
  nodeId: string;
  nodeType: NodeType;
  fieldKey: string;
  fieldDefinition: NodeAccountLevelTextFieldDefinition;
  isNodeConfigReadOnly: boolean;
};

function NodeGlobalTextField(props: Props) {
  const fd = props.fieldDefinition;

  const getGlobalField =
    useLocalStorageStore.use.getLocalAccountLevelNodeFieldValue();
  const setGlobalField =
    useLocalStorageStore.use.setLocalAccountLevelNodeFieldValue();

  const globalFieldValue = getGlobalField(props.nodeType, props.fieldKey);

  const [localFieldValue, setLocalFieldValue] = useState<string>(() => {
    return globalFieldValue ?? '';
  });

  useEffect(() => {
    setLocalFieldValue(globalFieldValue ?? '');
  }, [globalFieldValue]);

  const onSaveCallback = useCallback(() => {
    setGlobalField(props.nodeType, props.fieldKey, localFieldValue);
  }, [localFieldValue, props.fieldKey, props.nodeType, setGlobalField]);

  const getFieldFeedbacks = useNodeFieldFeedbackStore.use.getFieldFeedbacks();

  // NOTE: Global fields are hidden in the UI if we are in read-only mode
  if (props.isNodeConfigReadOnly) {
    return null;
  }

  const feedbacks = getFieldFeedbacks(props.nodeId, props.fieldKey);

  return (
    <NodeBoxSection>
      <FormControl>
        <FormLabel>{fd.label}</FormLabel>
        <Input
          type="password"
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
