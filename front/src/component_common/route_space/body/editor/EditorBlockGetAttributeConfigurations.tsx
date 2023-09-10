import Input from "@mui/joy/Input";
import { useState } from "react";
import { BlockGetAttribute, SpaceContent } from "../../../../static/spaceTypes";
import EditorBlockInputOutput from "./shared/EditorBlockInputOutput";
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
      <EditorBlockInputOutput
        isReadOnly={props.isReadOnly}
        block={props.selectedBlock}
        isInput={true}
        singleVariable={props.selectedBlock.singleInput}
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
