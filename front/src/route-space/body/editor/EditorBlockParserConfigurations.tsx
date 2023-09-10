import Textarea from "@mui/joy/Textarea";
import { useState } from "react";
import { BlockParser, SpaceContent } from "../../../static/spaceTypes";
import EditorBlockInputOutput from "./shared/EditorBlockInputOutput";
import {
  FieldHelperText,
  FieldRow,
  FieldTitle,
} from "./shared/editorCommonComponents";

type Props = {
  isReadOnly: boolean;
  javaScriptCode: string;
  onSaveJavaScriptCode: (javaScriptCode: string) => void;
  selectedBlock: BlockParser;
  spaceId: string;
  spaceContent: SpaceContent;
};

export default function EditorBlockParserConfigurations(props: Props) {
  const [javaScriptCode, setJavaScriptCode] = useState(props.javaScriptCode);

  return (
    <>
      <EditorBlockInputOutput
        isReadOnly={props.isReadOnly}
        block={props.selectedBlock}
        isInput={true}
        variableMap={props.selectedBlock.inputMap}
        spaceId={props.spaceId}
        spaceContent={props.spaceContent}
      />
      <FieldRow>
        <FieldTitle>Content</FieldTitle>
        <Textarea
          color="neutral"
          size="sm"
          variant="outlined"
          minRows={10}
          placeholder="Enter your message here"
          disabled={props.isReadOnly}
          value={javaScriptCode}
          onChange={(e) => {
            setJavaScriptCode(e.target.value);
          }}
          onKeyDown={(e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
              props.onSaveJavaScriptCode(javaScriptCode);
            }
          }}
          onBlur={() => props.onSaveJavaScriptCode(javaScriptCode)}
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
        variableMap={props.selectedBlock.outputMap}
        spaceId={props.spaceId}
        spaceContent={props.spaceContent}
      />
    </>
  );
}
