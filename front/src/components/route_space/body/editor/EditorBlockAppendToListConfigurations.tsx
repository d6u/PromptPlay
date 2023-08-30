import Input from "@mui/joy/Input";
import { useState } from "react";
import { BlockAppendToList, SpaceContent } from "../../../../static/spaceTypes";
import EditorBlockInputConfiguration from "./shared/EditorBlockInputConfiguration";
import EditorBlockOutputConfiguration from "./shared/EditorBlockOutputConfiguration";
import { FieldRow, FieldTitle } from "./shared/editorCommonComponents";

type Props = {
  isReadOnly: boolean;
  itemName: string;
  onSaveItemName: (itemName: string) => void;
  listName: string;
  onSaveListName: (listName: string) => void;
  selectedBlock: BlockAppendToList;
  spaceId: string;
  spaceContent: SpaceContent;
};

export default function EditorBlockAppendToListConfigurations(props: Props) {
  const [itemName, setItemName] = useState(props.itemName);
  const [listName, setListName] = useState(props.listName);

  return (
    <>
      <EditorBlockInputConfiguration
        isReadOnly={props.isReadOnly}
        block={props.selectedBlock}
        spaceId={props.spaceId}
        spaceContent={props.spaceContent}
      />
      <FieldRow>
        <FieldTitle>Item name</FieldTitle>
        <Input
          color="neutral"
          size="sm"
          variant="outlined"
          disabled={props.isReadOnly}
          value={itemName}
          onChange={(e) => {
            setItemName(e.target.value);
          }}
          onKeyUp={(e) => {
            if (e.key === "Enter") {
              props.onSaveItemName(itemName);
            }
          }}
          onBlur={() => props.onSaveItemName(itemName)}
        />
      </FieldRow>
      <FieldRow>
        <FieldTitle>List name</FieldTitle>
        <Input
          color="neutral"
          size="sm"
          variant="outlined"
          disabled={props.isReadOnly}
          value={listName}
          onChange={(e) => {
            setListName(e.target.value);
          }}
          onKeyUp={(e) => {
            if (e.key === "Enter") {
              props.onSaveListName(listName);
            }
          }}
          onBlur={() => props.onSaveListName(listName)}
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
