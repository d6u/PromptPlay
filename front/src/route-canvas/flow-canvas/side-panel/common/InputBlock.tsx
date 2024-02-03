import styled from '@emotion/styled';
import Input from '@mui/joy/Input';
import Option from '@mui/joy/Option';
import Select from '@mui/joy/Select';
import Textarea from '@mui/joy/Textarea';
import NodeBoxIncomingVariableReadonly from 'canvas-react-flow/node-box/NodeBoxIncomingVariableReadonly';
import { VariableValueType } from 'flow-models';
import { ReactNode, useEffect, useState } from 'react';
import TextareaReadonly from '../../../../canvas-react-flow/node-box/NodeBoxTextareaReadonly';

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

type Props = {
  isReadOnly: boolean;
  id: string;
  name: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any;
  onSaveValue: (value: string) => void;
  type: VariableValueType.String | VariableValueType.Number;
  onSaveType: (
    type: VariableValueType.String | VariableValueType.Number,
  ) => void;
};

export default function InputBlock(props: Props) {
  const [value, setValue] = useState(props.value);

  useEffect(() => {
    setValue(props.value);
  }, [props.value]);

  const [type, setType] = useState(props.type);

  useEffect(() => {
    setType(props.type);
  }, [props.type]);

  let valueInput: ReactNode;

  switch (type) {
    case VariableValueType.String:
      valueInput = props.isReadOnly ? (
        <TextareaReadonly minRows={2} value={value ?? ''} />
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
      break;
    case VariableValueType.Number:
      valueInput = props.isReadOnly ? (
        <NodeBoxIncomingVariableReadonly type="number" value={value ?? 0} />
      ) : (
        <Input
          color="primary"
          type="number"
          slotProps={{ input: { step: 0.1 } }}
          value={value ?? 0}
          onChange={(e) => {
            setValue(Number(e.target.value));
          }}
          onKeyUp={(e) => {
            if (e.key === 'Enter') {
              props.onSaveValue(value ?? 0);
            }
          }}
          onBlur={() => {
            props.onSaveValue(value ?? 0);
          }}
        />
      );
      break;
  }

  return (
    <Container>
      <FirstRow>
        <VariableName>{props.name}</VariableName>
        <Select
          disabled={props.isReadOnly}
          value={type}
          onChange={(e, value) => {
            const type = value!;
            setType(type);
            props.onSaveType(type);
          }}
        >
          {Object.values({
            [VariableValueType.String]: VariableValueType.String,
            [VariableValueType.Number]: VariableValueType.Number,
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
