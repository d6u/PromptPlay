import { BLOCK_CONFIGS } from "../../../../static/blockConfigs";
import { Block, SpaceContent } from "../../../../static/spaceTypes";
import EditorBlockInputConfiguration from "./EditorBlockInputConfiguration";
import EditorBlockOutputConfiguration from "./EditorBlockOutputConfiguration";
import EditorBlockUniqueConfigurations from "./EditorBlockUniqueConfigurations";
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
      </Body>
    </>
  );
}
