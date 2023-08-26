import { Block, SpaceContent } from "../../../../static/spaceTypes";
import { FieldRow, FieldTitle } from "./editorCommonComponents";
import Textarea from "@mui/joy/Textarea";
import { useState } from "react";

type Props = {
  value: string;
  onSaveValue: (value: string) => void;
  selectedBlock: Block;
  spaceId: string;
  spaceContent: SpaceContent;
};

export default function EditorBlockDatabagConfigurations(props: Props) {
  const [value, setValue] = useState(props.value);

  return (
    <FieldRow>
      <FieldTitle>Value (string only)</FieldTitle>
      <Textarea
        color="neutral"
        size="sm"
        variant="outlined"
        minRows={3}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyUp={(e) => {
          if (e.key === "Enter") {
            props.onSaveValue(value);
          }
        }}
        onBlur={() => props.onSaveValue(value)}
      />
    </FieldRow>
  );
}
