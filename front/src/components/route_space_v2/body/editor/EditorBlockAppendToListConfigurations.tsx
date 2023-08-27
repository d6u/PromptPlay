import { Block, SpaceContent } from "../../../../static/spaceTypes";
import { FieldRow, FieldTitle } from "./editorCommonComponents";
import Input from "@mui/joy/Input";
import { useState } from "react";

type Props = {
  itemName: string;
  onSaveItemName: (itemName: string) => void;
  listName: string;
  onSaveListName: (listName: string) => void;
  selectedBlock: Block;
  spaceId: string;
  spaceContent: SpaceContent;
};

export default function EditorBlockAppendToListConfigurations(props: Props) {
  const [itemName, setItemName] = useState(props.itemName);
  const [listName, setListName] = useState(props.listName);

  return (
    <>
      <FieldRow>
        <FieldTitle>Item name</FieldTitle>
        <Input
          color="neutral"
          size="sm"
          variant="outlined"
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
    </>
  );
}
