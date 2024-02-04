import styled from '@emotion/styled';
import Input from '@mui/joy/Input';
import { useState } from 'react';
import NodeBoxCommonRemoveButton from './NodeBoxCommonRemoveButton';
import NodeBoxIncomingVariableReadonly from './NodeBoxIncomingVariableReadonly';

const Container = styled.div`
  margin-top: 5px;
  display: flex;
  align-items: center;
  gap: 5px;

  &:first-of-type {
    margin-top: 0;
  }
`;

type Props =
  | {
      isReadOnly?: false;
      name: string;
      onConfirmNameChange: (name: string) => void;
      onRemove: () => void;
    }
  | {
      isReadOnly: true;
      name: string;
    };

export default function NodeBoxOutgoingConnectorBlock(props: Props) {
  const [name, setName] = useState(props.name);

  return (
    <Container>
      {props.isReadOnly ? (
        <NodeBoxIncomingVariableReadonly value={name} />
      ) : (
        <Input
          color="primary"
          style={{ flexGrow: 1 }}
          disabled={props.isReadOnly ?? false}
          value={name}
          onChange={(e) => {
            setName(e.target.value);
          }}
          onKeyUp={(e) => {
            if (props.isReadOnly) {
              return;
            }
            if (e.key === 'Enter') {
              props.onConfirmNameChange(name);
            }
          }}
          onBlur={() => {
            if (props.isReadOnly) {
              return;
            }
            props.onConfirmNameChange(name);
          }}
        />
      )}
      {!props.isReadOnly && (
        <NodeBoxCommonRemoveButton onClick={() => props.onRemove()} />
      )}
    </Container>
  );
}