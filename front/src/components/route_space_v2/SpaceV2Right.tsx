import { spaceV2SelectedBlockIdState } from "../../state/store";
import EditorVariableMap from "./EditorVariableMap";
import { UPDATE_SPACE_V2_MUTATION } from "./graphql";
import { SpaceContent } from "./interfaces";
import { BLOCK_CONFIGS, isBlockGroupAnchor, isObject } from "./utils";
import { useMutation } from "@apollo/client";
import { useRecoilValue } from "recoil";
import styled from "styled-components";
import u from "updeep";

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
  content: SpaceContent;
};

export default function SpaceV2Right(props: Props) {
  const [updateSpaceV2] = useMutation(UPDATE_SPACE_V2_MUTATION);

  const spaceV2SelectedBlockId = useRecoilValue(spaceV2SelectedBlockIdState);

  const block = spaceV2SelectedBlockId
    ? props.content.components[spaceV2SelectedBlockId]
    : null;

  if (block == null || isBlockGroupAnchor(block)) {
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
                if (!isObject(block.input)) {
                  return;
                }

                const count = Object.keys(block.input).length;
                const scopeName = `scope_name_${count + 1}`;
                const argName = `arg_vary_vary_long_name_${count + 1}`;

                const newContent = u<any, SpaceContent>(
                  {
                    components: {
                      [block.id]: {
                        input: {
                          [scopeName]: argName,
                        },
                      },
                    },
                  },
                  props.content
                ) as SpaceContent;

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
                if (!isObject(block.output)) {
                  return;
                }

                const count = Object.keys(block.output).length;
                const localName = `local_name_${count + 1}`;
                const scopeName = `scope_name_pretty_long_${count + 1}`;

                const newContent = u<any, SpaceContent>(
                  {
                    components: {
                      [block.id]: {
                        output: {
                          [localName]: scopeName,
                        },
                      },
                    },
                  },
                  props.content
                ) as SpaceContent;

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
