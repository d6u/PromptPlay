import styled from "@emotion/styled";
import Button from "@mui/joy/Button";
import { dissoc } from "ramda";
import u from "updeep";
import { useMutation } from "urql";
import { UPDATE_SPACE_CONTENT_MUTATION } from "../../../../state/spaceGraphQl";
import { getBlockConfigByType } from "../../../../static/blockConfigs";
import { Block, SpaceContent } from "../../../../static/spaceTypes";
import { pullBlockFromBlocks } from "../../../../static/spaceUtils";
import EditorBlockConfigurations from "./EditorBlockConfigurations";
import {
  FieldDescriptionText,
  FieldRow,
  FieldTitle,
} from "./shared/editorCommonComponents";

const Header = styled.div`
  align-self: stretch;
  display: flex;
  height: 50px;
  padding: 0px 15px;
  align-items: center;
  gap: 10px;
  justify-content: space-between;
`;

const HeaderText = styled.div`
  font-family: var(--mono-font-family);
  font-size: 16px;
  font-weight: 700;
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

const LllOutputContainer = styled.div`
  padding: 10px;
  border-radius: 5px;
  border: 1px solid #c5c5d2;
`;

type Props = {
  isReadOnly: boolean;
  selectedBlock: Block;
  spaceId: string;
  spaceContent: SpaceContent;
};

export default function EditorBlock(props: Props) {
  const [, updateSpaceV2] = useMutation(UPDATE_SPACE_CONTENT_MUTATION);

  const blockConfig = getBlockConfigByType(props.selectedBlock.type);

  return (
    <>
      <Header>
        <HeaderText>
          {blockConfig.title} {props.isReadOnly ? "(read only)" : null}
        </HeaderText>
        {props.isReadOnly ? null : (
          <Button
            color="danger"
            size="sm"
            variant="plain"
            onClick={() => {
              let newContent = props.spaceContent;

              const [pulledBlockAnchor, newBlockAnchors] = pullBlockFromBlocks(
                props.selectedBlock.id,
                newContent.root.blocks
              );

              if (pulledBlockAnchor == null) {
                throw new Error("Block not found");
              }

              newContent = u({
                root: {
                  blocks: u.constant(newBlockAnchors),
                },
                components: dissoc(pulledBlockAnchor.id),
              })(newContent) as SpaceContent;

              updateSpaceV2({
                spaceId: props.spaceId,
                content: JSON.stringify(newContent),
              });
            }}
          >
            Delete
          </Button>
        )}
      </Header>
      <Body>
        <EditorBlockConfigurations
          isReadOnly={props.isReadOnly}
          selectedBlock={props.selectedBlock}
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
              <LllOutputContainer>
                {props.selectedBlock.outputContent
                  .split("\n")
                  .map((line, index) => (
                    <div key={index}>{line}</div>
                  ))}
              </LllOutputContainer>
            </FieldRow>
          </>
        )}
      </Body>
    </>
  );
}
