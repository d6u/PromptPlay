import Textarea from "@mui/joy/Textarea";
import { useState } from "react";
import { BlockDatabag, SpaceContent } from "../../../../static/spaceTypes";
import EditorBlockInputOutput from "./shared/EditorBlockInputOutput";
import {
  FieldHelperText,
  FieldRow,
  FieldTitle,
} from "./shared/editorCommonComponents";

type Props = {
  isReadOnly: boolean;
  value: string;
  onSaveValue: (value: string) => void;
  selectedBlock: BlockDatabag;
  spaceId: string;
  spaceContent: SpaceContent;
};

export default function EditorBlockDatabagConfigurations(props: Props) {
  const [value, setValue] = useState(props.value);

  return (
    <>
      <FieldRow>
        <FieldTitle>Value (string only)</FieldTitle>
        <Textarea
          color="neutral"
          size="sm"
          variant="outlined"
          minRows={3}
          disabled={props.isReadOnly}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyUp={(e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
              props.onSaveValue(value);
            }
          }}
          onBlur={() => props.onSaveValue(value)}
        />
        <FieldHelperText>
          Press <code>CMD</code> + <code>ENTER</code> () or <code>CTRL</code> +{" "}
          <code>ENTER</code> (Windows) to save. Unfocus will also save.
        </FieldHelperText>
      </FieldRow>
      <EditorBlockInputOutput
        isReadOnly={props.isReadOnly}
        block={props.selectedBlock}
        isInput={false}
        singleVariable={props.selectedBlock.singleOuput}
        spaceId={props.spaceId}
        spaceContent={props.spaceContent}
      />
    </>
  );
}
