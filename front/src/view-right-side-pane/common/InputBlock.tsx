import styled from '@emotion/styled';
import { Option, Select, Textarea } from '@mui/joy';
import { ReactNode, useEffect, useState } from 'react';

import { VariableValueType } from 'flow-models';

import ReadonlyTextarea from 'generic-components/ReadonlyTextarea';

type Props = {
  isReadOnly: boolean;
  id: string;
  name: string;
  value: string;
  onSaveValue: (value: string) => void;
};

function InputBlock(props: Props) {
  const [value, setValue] = useState(props.value);

  useEffect(() => {
    setValue(props.value);
  }, [props.value]);

  const valueInput: ReactNode = props.isReadOnly ? (
    <ReadonlyTextarea minRows={2} value={value ?? ''} />
  ) : (
    <Textarea
      color="primary"
      minRows={2}
      value={value ?? ''}
      onChange={(e) => {
        setValue(e.target.value);
      }}
      onKeyUp={(e) => {
        if (e.key === 'Enter') {
          props.onSaveValue(value ?? '');
        }
      }}
      onBlur={() => {
        props.onSaveValue(value ?? '');
      }}
    />
  );

  return (
    <Container>
      <FirstRow>
        <VariableName>{props.name}</VariableName>
        <Select
          disabled={props.isReadOnly}
          value={VariableValueType.String}
          onChange={(e, value) => {}}
        >
          {Object.values({
            [VariableValueType.String]: VariableValueType.String,
          }).map((type) => (
            <Option key={type} value={type}>
              {type}
            </Option>
          ))}
        </Select>
      </FirstRow>
      {valueInput}
    </Container>
  );
}

const Container = styled.div`
  margin-bottom: 10px;
`;

const FirstRow = styled.div`
  display: flex;
  gap: 5px;
  margin-bottom: 5px;
`;

const VariableName = styled.div`
  height: 32px;
  font-size: 14px;
  line-height: 32px;
  padding: 0 9px;
  flex-grow: 1;
`;

export default InputBlock;
