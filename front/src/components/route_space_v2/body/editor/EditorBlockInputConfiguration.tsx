import {
  Block,
  BlockVariablesConfiguration,
  SpaceContent,
} from "../../../../static/spaceTypes";
import EditorBlockInputOutput from "./EditorBlockInputOutput";

type Props = {
  block: Block;
  spaceId: string;
  spaceContent: SpaceContent;
};

export default function EditorBlockInputConfiguration(props: Props) {
  switch (props.block.inputConfiguration) {
    case BlockVariablesConfiguration.NonConfigurable:
      return null;
    case BlockVariablesConfiguration.Single:
      return (
        <EditorBlockInputOutput
          block={props.block}
          isInput={true}
          singleVariable={props.block.singleInput}
          spaceId={props.spaceId}
          spaceContent={props.spaceContent}
        />
      );
    case BlockVariablesConfiguration.Map:
      return (
        <EditorBlockInputOutput
          block={props.block}
          isInput={true}
          variableMap={props.block.inputMap}
          spaceId={props.spaceId}
          spaceContent={props.spaceContent}
        />
      );
  }
}
