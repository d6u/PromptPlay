import { UPDATE_SPACE_V2_MUTATION } from "../../../../state/spaceGraphQl";
import { Block, BlockType, SpaceContent } from "../../../../static/spaceTypes";
import EditorBlockAppendToListConfigurations from "./EditorBlockAppendToListConfigurations";
import EditorBlockDatabagConfigurations from "./EditorBlockDatabagConfigurations";
import EditorBlockGetAttributeConfigurations from "./EditorBlockGetAttributeConfigurations";
import EditorBlockLlmConfigurations from "./EditorBlockLlmConfigurations";
import EditorBlockLlmMessageConfigurations from "./EditorBlockLlmMessageConfigurations";
import { useMutation } from "@apollo/client";
import u from "updeep";

type Props = {
  selectedBlock: Block;
  spaceId: string;
  spaceContent: SpaceContent;
};

export default function EditorBlockUniqueConfigurations(props: Props) {
  const [updateSpaceV2] = useMutation(UPDATE_SPACE_V2_MUTATION);

  switch (props.selectedBlock.type) {
    case BlockType.Databag:
      return (
        <EditorBlockDatabagConfigurations
          value={props.selectedBlock.value}
          onSaveValue={(value) => {
            const newContent = u({
              components: {
                [props.selectedBlock.id]: { value },
              },
            })(props.spaceContent) as SpaceContent;

            updateSpaceV2({
              variables: {
                spaceId: props.spaceId,
                content: JSON.stringify(newContent),
              },
            });
          }}
          selectedBlock={props.selectedBlock}
          spaceId={props.spaceId}
          spaceContent={props.spaceContent}
        />
      );
    case BlockType.LlmMessage:
      return (
        <EditorBlockLlmMessageConfigurations
          role={props.selectedBlock.role}
          onSaveRole={(role) => {
            const newContent = u({
              components: {
                [props.selectedBlock.id]: { role },
              },
            })(props.spaceContent) as SpaceContent;

            updateSpaceV2({
              variables: {
                spaceId: props.spaceId,
                content: JSON.stringify(newContent),
              },
            });
          }}
          content={props.selectedBlock.content}
          onSaveContent={(content) => {
            const newContent = u({
              components: {
                [props.selectedBlock.id]: { content },
              },
            })(props.spaceContent) as SpaceContent;

            updateSpaceV2({
              variables: {
                spaceId: props.spaceId,
                content: JSON.stringify(newContent),
              },
            });
          }}
          listNameToAppend={props.selectedBlock.listNameToAppend}
          onSaveListNameToAppend={(listNameToAppend) => {
            const newContent = u({
              components: {
                [props.selectedBlock.id]: { listNameToAppend },
              },
            })(props.spaceContent) as SpaceContent;

            updateSpaceV2({
              variables: {
                spaceId: props.spaceId,
                content: JSON.stringify(newContent),
              },
            });
          }}
          selectedBlock={props.selectedBlock}
          spaceId={props.spaceId}
          spaceContent={props.spaceContent}
        />
      );
    case BlockType.Llm:
      return (
        <EditorBlockLlmConfigurations
          model={props.selectedBlock.model}
          onSaveModel={(model) => {
            const newContent = u({
              components: {
                [props.selectedBlock.id]: { model },
              },
            })(props.spaceContent) as SpaceContent;

            updateSpaceV2({
              variables: {
                spaceId: props.spaceId,
                content: JSON.stringify(newContent),
              },
            });
          }}
          temperature={props.selectedBlock.temperature}
          onSaveTemperaturel={(temperature) => {
            const newContent = u({
              components: {
                [props.selectedBlock.id]: { temperature },
              },
            })(props.spaceContent) as SpaceContent;

            updateSpaceV2({
              variables: {
                spaceId: props.spaceId,
                content: JSON.stringify(newContent),
              },
            });
          }}
          stop={props.selectedBlock.stop}
          onSaveStop={(stop) => {
            const newContent = u({
              components: {
                [props.selectedBlock.id]: { stop },
              },
            })(props.spaceContent) as SpaceContent;

            updateSpaceV2({
              variables: {
                spaceId: props.spaceId,
                content: JSON.stringify(newContent),
              },
            });
          }}
          variableNameForContent={props.selectedBlock.variableNameForContent}
          onSaveVariableNameForContent={(variableNameForContent) => {
            const newContent = u({
              components: {
                [props.selectedBlock.id]: { variableNameForContent },
              },
            })(props.spaceContent) as SpaceContent;

            updateSpaceV2({
              variables: {
                spaceId: props.spaceId,
                content: JSON.stringify(newContent),
              },
            });
          }}
          selectedBlock={props.selectedBlock}
          spaceId={props.spaceId}
          spaceContent={props.spaceContent}
        />
      );
    case BlockType.AppendToList:
      return (
        <EditorBlockAppendToListConfigurations
          itemName={props.selectedBlock.itemName}
          onSaveItemName={(itemName) => {
            const newContent = u({
              components: {
                [props.selectedBlock.id]: { itemName },
              },
            })(props.spaceContent) as SpaceContent;

            updateSpaceV2({
              variables: {
                spaceId: props.spaceId,
                content: JSON.stringify(newContent),
              },
            });
          }}
          listName={props.selectedBlock.listName}
          onSaveListName={(listName) => {
            const newContent = u({
              components: {
                [props.selectedBlock.id]: { listName },
              },
            })(props.spaceContent) as SpaceContent;

            updateSpaceV2({
              variables: {
                spaceId: props.spaceId,
                content: JSON.stringify(newContent),
              },
            });
          }}
          selectedBlock={props.selectedBlock}
          spaceId={props.spaceId}
          spaceContent={props.spaceContent}
        />
      );
    case BlockType.GetAttribute:
      return (
        <EditorBlockGetAttributeConfigurations
          attribute={props.selectedBlock.attribute}
          onSaveAttribute={(attribute) => {
            const newContent = u({
              components: {
                [props.selectedBlock.id]: { attribute },
              },
            })(props.spaceContent) as SpaceContent;

            updateSpaceV2({
              variables: {
                spaceId: props.spaceId,
                content: JSON.stringify(newContent),
              },
            });
          }}
          selectedBlock={props.selectedBlock}
          spaceId={props.spaceId}
          spaceContent={props.spaceContent}
        />
      );
  }
}
