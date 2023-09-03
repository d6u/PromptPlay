import Input from "@mui/joy/Input";
import { useEffect, useState } from "react";

type Props = {
  isReadOnly: boolean;
  isInput: boolean;
  variableName: string;
  onSave: (value: string) => void;
};

export default function EditorSingleScopeVariable(props: Props) {
  const [variableName, setVariableName] = useState<string>(props.variableName);

  useEffect(() => {
    setVariableName(props.variableName);
  }, [props.variableName]);

  return (
    <Input
      color="neutral"
      size="sm"
      variant="outlined"
      style={{ flexGrow: 1 }}
      placeholder={
        props.isInput ? "Input variable name" : "Output variable name"
      }
      disabled={props.isReadOnly}
      value={variableName}
      onChange={(e) => {
        setVariableName(e.target.value);
      }}
      onKeyUp={(e) => {
        if (e.key === "Enter") {
          props.onSave(variableName);
        }
      }}
      onBlur={() => props.onSave(variableName)}
    />
  );
}
