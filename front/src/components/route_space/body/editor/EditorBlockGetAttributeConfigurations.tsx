import Input from "@mui/joy/Input";
import { useState } from "react";
import { BlockGetAttribute, SpaceContent } from "../../../../static/spaceTypes";
import EditorBlockInputConfiguration from "./shared/EditorBlockInputConfiguration";
import EditorBlockOutputConfiguration from "./shared/EditorBlockOutputConfiguration";
import { FieldRow, FieldTitle } from "./shared/editorCommonComponents";

type Props = {
  isReadOnly: boolean;
  attribute: string;
  onSaveAttribute: (attribute: string) => void;
  selectedBlock: BlockGetAttribute;
  spaceId: string;
  spaceContent: SpaceContent;
};

export default function EditorBlockGetAttributeConfigurations(props: Props) {
  const [attribute, setAttribute] = useState(props.attribute);

  return (
    <>
      <EditorBlockInputConfiguration
        isReadOnly={props.isReadOnly}
        block={props.selectedBlock}
        spaceId={props.spaceId}
        spaceContent={props.spaceContent}
      />
      <FieldRow>
        <FieldTitle>Attribute</FieldTitle>
        <Input
          color="neutral"
          size="sm"
          variant="outlined"
          disabled={props.isReadOnly}
          value={attribute}
          onChange={(e) => {
            setAttribute(e.target.value);
          }}
          onKeyUp={(e) => {
            if (e.key === "Enter") {
              props.onSaveAttribute(attribute);
            }
          }}
          onBlur={() => props.onSaveAttribute(attribute)}
        />
      </FieldRow>
      <EditorBlockOutputConfiguration
        isReadOnly={props.isReadOnly}
        block={props.selectedBlock}
        spaceId={props.spaceId}
        spaceContent={props.spaceContent}
      />
    </>
  );
}
