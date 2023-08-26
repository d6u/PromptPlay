import { spaceV2SelectedBlockSelector } from "../../state/store";
import { BLOCK_CONFIGS } from "../../static/blockConfigs";
import { BlockType } from "../../static/spaceTypes";
import EditorBlockInputOutput from "./EditorBlockInputOutput";
import Input from "@mui/joy/Input";
import Option from "@mui/joy/Option";
import Radio from "@mui/joy/Radio";
import RadioGroup from "@mui/joy/RadioGroup";
import Select from "@mui/joy/Select";
import Textarea from "@mui/joy/Textarea";
import { useRecoilValue } from "recoil";
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

const FieldRow = styled.div`
  margin-bottom: 10px;
`;

const FieldTitle = styled.div`
  margin-bottom: 5px;
`;

type Props = {
  spaceId: string;
};

export default function EditorBlock(props: Props) {
  const block = useRecoilValue(spaceV2SelectedBlockSelector)!;

  const blockConfig = BLOCK_CONFIGS[block.type];

  let editorContent = null;

  switch (block.type) {
    case BlockType.Databag:
      editorContent = (
        <FieldRow>
          <FieldTitle>Value</FieldTitle>
          <Textarea
            color="neutral"
            size="sm"
            variant="outlined"
            minRows={3}
            value=""
          />
        </FieldRow>
      );
      break;
    case BlockType.LlmMessage:
      editorContent = (
        <>
          <FieldRow>
            <FieldTitle>Role</FieldTitle>
            <RadioGroup orientation="horizontal" value="user">
              <Radio
                size="sm"
                variant="outlined"
                name="role"
                value="system"
                label="System"
              />
              <Radio
                size="sm"
                variant="outlined"
                name="role"
                value="user"
                label="User"
              />
              <Radio
                size="sm"
                variant="outlined"
                name="role"
                value="assistant"
                label="Assistant"
              />
            </RadioGroup>
          </FieldRow>
          <FieldRow>
            <FieldTitle>Content</FieldTitle>
            <Textarea
              color="neutral"
              size="sm"
              variant="outlined"
              minRows={3}
              value=""
            />
          </FieldRow>
        </>
      );
      break;
    case BlockType.Llm:
      editorContent = (
        <>
          <FieldRow>
            <FieldTitle>Model</FieldTitle>
            <Select size="sm" variant="outlined" value="gpt-3.5-turbo">
              <Option value="gpt-3.5-turbo">gpt-3.5-turbo</Option>
              <Option value="gpt-4">gpt-4</Option>
            </Select>
          </FieldRow>
          <FieldRow>
            <FieldTitle>Temperature</FieldTitle>
            <Input
              color="neutral"
              size="sm"
              variant="outlined"
              type="number"
              slotProps={{ input: { min: 0, max: 2, step: 0.1 } }}
              value={1}
            />
          </FieldRow>
          <FieldRow>
            <FieldTitle>Stop</FieldTitle>
            <Input color="neutral" size="sm" variant="outlined" value="" />
          </FieldRow>
        </>
      );
      break;
    case BlockType.AppendToList:
      editorContent = (
        <>
          <FieldRow>
            <FieldTitle>Item name</FieldTitle>
            <Input color="neutral" size="sm" variant="outlined" value="" />
          </FieldRow>
          <FieldRow>
            <FieldTitle>List name</FieldTitle>
            <Input color="neutral" size="sm" variant="outlined" value="" />
          </FieldRow>
        </>
      );
      break;
    case BlockType.GetAttribute:
      editorContent = (
        <>
          <FieldRow>
            <FieldTitle>Attribute</FieldTitle>
            <Input color="neutral" size="sm" variant="outlined" value="" />
          </FieldRow>
        </>
      );
      break;
  }

  return (
    <>
      <Header>
        <HeaderText>{blockConfig.title}</HeaderText>
      </Header>
      <Body>
        {blockConfig.hasInput && (
          <EditorBlockInputOutput
            spaceId={props.spaceId}
            blockId={block.id}
            inputOutput={block.input!}
            blockConfig={blockConfig}
          />
        )}
        {editorContent}
        {blockConfig.hasOutput && (
          <EditorBlockInputOutput
            spaceId={props.spaceId}
            blockId={block.id}
            inputOutput={block.output!}
            blockConfig={blockConfig}
            isOutput
          />
        )}
      </Body>
    </>
  );
}
