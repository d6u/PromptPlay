import { BLOCK_CONFIGS } from "../../../../static/blockConfigs";
import { Block, SpaceContent } from "../../../../static/spaceTypes";
import EditorBlockInputConfiguration from "./EditorBlockInputConfiguration";
import EditorBlockOutputConfiguration from "./EditorBlockOutputConfiguration";
import EditorBlockUniqueConfigurations from "./EditorBlockUniqueConfigurations";
import {
  FieldDescriptionText,
  FieldRow,
  FieldTitle,
} from "./editorCommonComponents";
import Textarea from "@mui/joy/Textarea";
import styled from "styled-components";

const Header = styled.div`
  display: flex;
  height: 50px;
  padding: 0px 15px;
  align-items: center;
  gap: 10px;
  align-self: stretch;
`;

const HeaderText = styled.div`
  font-family: var(--mono-font-family);
  font-size: 16px;
  font-weight: 700;
  text-transform: capitalize;
`;

const Body = styled.div`
  padding: 0px 15px 10px 15px;
  color: #000;
  font-size: 15px;
  font-weight: 400;
`;

const Bar = styled.div`
  height: 3px;
  background-color: #318a09;
  margin: 10px 0px;
`;

type Props = {
  selectedBlock: Block;
  spaceId: string;
  spaceContent: SpaceContent;
};

export default function EditorBlock(props: Props) {
  const blockConfig = BLOCK_CONFIGS[props.selectedBlock.type];

  return (
    <>
      <Header>
        <HeaderText>{blockConfig.title}</HeaderText>
      </Header>
      <Body>
        <EditorBlockInputConfiguration
          block={props.selectedBlock}
          spaceId={props.spaceId}
          spaceContent={props.spaceContent}
        />
        <EditorBlockUniqueConfigurations
          selectedBlock={props.selectedBlock}
          spaceId={props.spaceId}
          spaceContent={props.spaceContent}
        />
        <EditorBlockOutputConfiguration
          block={props.selectedBlock}
          spaceId={props.spaceId}
          spaceContent={props.spaceContent}
        />
        {props.selectedBlock.outputContent && (
          <>
            <Bar />
            <FieldRow>
              <FieldTitle>Current output content</FieldTitle>
              <FieldDescriptionText>
                This is the output from LLM in the last run.
              </FieldDescriptionText>
              <Textarea
                color="neutral"
                size="sm"
                variant="outlined"
                minRows={3}
                value={props.selectedBlock.outputContent}
              />
            </FieldRow>
          </>
        )}
      </Body>
    </>
  );
}
