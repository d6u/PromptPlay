import Input from "@mui/joy/Input";
import Option from "@mui/joy/Option";
import Select from "@mui/joy/Select";
import Textarea from "@mui/joy/Textarea";
import { ReactNode, useState } from "react";
import styled from "styled-components";
import { InputValueType } from "../../../static/flowTypes";

const Container = styled.div`
  margin-bottom: 10px;
`;

const InputRow = styled.div`
  display: flex;
  gap: 5px;
  margin-bottom: 5px;
`;

type Props = {
  id: string;
  name: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any;
  onSaveValue: (value: string) => void;
  type?: InputValueType;
  onSaveType: (type: InputValueType) => void;
};

export default function InputBlock(props: Props) {
  const [value, setValue] = useState(props.value);
  const [type, setType] = useState(props.type ?? InputValueType.String);

  let valueInput: ReactNode;

  switch (type) {
    case InputValueType.String:
      valueInput = (
        <Textarea
          color="primary"
          size="sm"
          variant="outlined"
          minRows={2}
          value={value ?? ""}
          onChange={(e) => {
            setValue(e.target.value);
          }}
          onKeyUp={(e) => {
            if (e.key === "Enter") {
              props.onSaveValue(value ?? "");
            }
          }}
          onBlur={() => {
            props.onSaveValue(value ?? "");
          }}
        />
      );
      break;
    case InputValueType.Number:
      valueInput = (
        <Input
          color="primary"
          size="sm"
          variant="outlined"
          type="number"
          slotProps={{ input: { step: 0.1 } }}
          value={value ?? 0}
          onChange={(e) => {
            setValue(Number(e.target.value));
          }}
          onKeyUp={(e) => {
            if (e.key === "Enter") {
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
      <InputRow>
        <Input
          color="primary"
          size="sm"
          variant="outlined"
          style={{ flexGrow: 1 }}
          disabled
          value={props.name}
        />
        <Select
          color="neutral"
          size="sm"
          variant="outlined"
          value={type}
          onChange={(e, value) => {
            const type = value!;
            setType(type);
            props.onSaveType(type);
          }}
        >
          {Object.values(InputValueType).map((type) => (
            <Option key={type} value={type}>
              {type}
            </Option>
          ))}
        </Select>
      </InputRow>
      {valueInput}
    </Container>
  );
}
