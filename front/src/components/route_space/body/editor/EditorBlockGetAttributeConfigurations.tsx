import Input from "@mui/joy/Input";
import { useState } from "react";
import { Block, SpaceContent } from "../../../../static/spaceTypes";
import { FieldRow, FieldTitle } from "./shared/editorCommonComponents";

type Props = {
  attribute: string;
  onSaveAttribute: (attribute: string) => void;
  selectedBlock: Block;
  spaceId: string;
  spaceContent: SpaceContent;
};

export default function EditorBlockGetAttributeConfigurations(props: Props) {
  const [attribute, setAttribute] = useState(props.attribute);

  return (
    <FieldRow>
      <FieldTitle>Attribute</FieldTitle>
      <Input
        color="neutral"
        size="sm"
        variant="outlined"
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
  );
}
