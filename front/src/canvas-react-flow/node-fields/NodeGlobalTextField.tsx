import { FormControl, FormHelperText, FormLabel, Input } from '@mui/joy';
import NodeBoxSection from 'canvas-react-flow/node-box/NodeBoxSection';
import {
  GlobalFieldDefinition,
  NodeType,
  TextFieldDefinition,
} from 'flow-models';
import { useCallback, useEffect, useState } from 'react';
import invariant from 'tiny-invariant';
import { useLocalStorageStore } from '../../state/appState';

type Props = {
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

  const storageKey = `${props.nodeType}:${globalFieldDefinitionKey}`;

  const getGlobalField = useLocalStorageStore.use.getGlobalField();
  const setGlobalField = useLocalStorageStore.use.setGlobalField();

  const globalFieldValue = getGlobalField(storageKey) as string | undefined;

  const [localFieldValue, setLocalFieldValue] = useState<string>(() => {
    return globalFieldValue ?? '';
  });

  useEffect(() => {
    setLocalFieldValue(globalFieldValue ?? '');
  }, [globalFieldValue]);

  const onSaveCallback = useCallback(() => {
    setGlobalField(storageKey, localFieldValue);
  }, [storageKey, localFieldValue, setGlobalField]);

  // NOTE: Global fields are hidden in the UI if we are in read-only mode
  if (props.isNodeConfigReadOnly) {
    return null;
  }

  return (
    <NodeBoxSection>
      <FormControl>
        <FormLabel>{fd.label}</FormLabel>
        <Input
          type={gfd.isSecret ? 'password' : 'text'}
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
        {fd.helperMessage && (
          <FormHelperText>{fd.helperMessage}</FormHelperText>
        )}
      </FormControl>
    </NodeBoxSection>
  );
}

export default NodeGlobalTextField;
