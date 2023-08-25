import { spaceV2SelectedBlockIdState } from "../../state/store";
import EditorVariableMap from "./EditorVariableMap";
import { UPDATE_SPACE_V2_MUTATION } from "./graphql";
import {
  BLOCK_CONFIGS,
  Block,
  BlockGroup,
  isBlockGroup,
  isObject,
} from "./utils";
import { useMutation } from "@apollo/client";
import fp from "lodash/fp";
import { useRecoilValue } from "recoil";
import styled from "styled-components";

const Container = styled.div`
  width: 500px;
  padding: 20px 20px 20px 0;
  overflow-y: auto;
`;

const Content = styled.div`
  min-height: 100%;
  border-radius: 5px;
  border: 1px solid #c5c5d2;
`;

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
  padding: 0px 15px;
  color: #000;
  font-size: 15px;
  font-weight: 400;
`;

type Props = {
  spaceId: string;
  content: BlockGroup | null;
};

export default function SpaceV2Right(props: Props) {
  const [updateSpaceV2] = useMutation(UPDATE_SPACE_V2_MUTATION);

  const spaceV2SelectedBlockId = useRecoilValue(spaceV2SelectedBlockIdState);

  const block = props.content?.blocks.find(
    (block) => block.id === spaceV2SelectedBlockId
  );

  if (block == null || isBlockGroup(block)) {
    return null;
  }

  const blockConfig = BLOCK_CONFIGS[block.type];

  return (
    <Container>
      <Content>
        <Header>
          <HeaderText>{blockConfig.title}</HeaderText>
        </Header>
        <Body>
          {blockConfig.hasInput && (
            <EditorVariableMap
              content={props.content}
              onAddVariableMapEntry={() => {
                const blockIndex = props.content!.blocks.findIndex(
                  (block) => block.id === spaceV2SelectedBlockId
                );

                const targetBlock = props.content!.blocks[blockIndex] as Block;

                if (!isObject(targetBlock.input)) {
                  return;
                }

                const count = Object.keys(targetBlock.input).length;

                const newBlock = {
                  ...targetBlock,
                  input: {
                    ...targetBlock.input,
                    [`scope_name_${count + 1}`]: `arg_vary_vary_long_name_${
                      count + 1
                    }`,
                  },
                };

                const newContent = fp.assign(props.content, {
                  blocks: [
                    ...props.content!.blocks.slice(0, blockIndex),
                    newBlock,
                    ...props.content!.blocks.slice(blockIndex + 1),
                  ],
                });

                updateSpaceV2({
                  variables: {
                    spaceId: props.spaceId,
                    content: JSON.stringify(newContent),
                  },
                });
              }}
            />
          )}
          {blockConfig.hasOutput && (
            <EditorVariableMap
              content={props.content}
              isOutput
              onAddVariableMapEntry={() => {
                const blockIndex = props.content!.blocks.findIndex(
                  (block) => block.id === spaceV2SelectedBlockId
                );

                const targetBlock = props.content!.blocks[blockIndex] as Block;

                if (!isObject(targetBlock.output)) {
                  return;
                }

                const count = Object.keys(targetBlock.output).length;

                const newBlock = {
                  ...targetBlock,
                  output: {
                    ...targetBlock.output,
                    [`local_name_${count + 1}`]: `scope_name_pretty_long_${
                      count + 1
                    }`,
                  },
                };

                const newContent = fp.assign(props.content, {
                  blocks: [
                    ...props.content!.blocks.slice(0, blockIndex),
                    newBlock,
                    ...props.content!.blocks.slice(blockIndex + 1),
                  ],
                });

                updateSpaceV2({
                  variables: {
                    spaceId: props.spaceId,
                    content: JSON.stringify(newContent),
                  },
                });
              }}
            />
          )}
        </Body>
      </Content>
    </Container>
  );
}
