import {
  Block,
  BlockVariablesConfiguration,
  SpaceContent,
} from "../../../../../static/spaceTypes";
import EditorBlockInputOutput from "./EditorBlockInputOutput";

type Props = {
  block: Block;
  spaceId: string;
  spaceContent: SpaceContent;
};

export default function EditorBlockOutputConfiguration(props: Props) {
  switch (props.block.outputConfiguration) {
    case BlockVariablesConfiguration.NonConfigurable:
      return null;
    case BlockVariablesConfiguration.Single:
      return (
        <EditorBlockInputOutput
          block={props.block}
          isInput={false}
          singleVariable={props.block.singleOuput}
          spaceId={props.spaceId}
          spaceContent={props.spaceContent}
        />
      );
    case BlockVariablesConfiguration.Map:
      return (
        <EditorBlockInputOutput
          block={props.block}
          isInput={false}
          variableMap={props.block.outputMap}
          spaceId={props.spaceId}
          spaceContent={props.spaceContent}
        />
      );
  }
}
