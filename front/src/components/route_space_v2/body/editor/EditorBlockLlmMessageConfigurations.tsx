import {
  Block,
  LlmMessageRole,
  SpaceContent,
} from "../../../../static/spaceTypes";
import { FieldRow, FieldTitle } from "./editorCommonComponents";
import Radio from "@mui/joy/Radio";
import RadioGroup from "@mui/joy/RadioGroup";
import Textarea from "@mui/joy/Textarea";
import { useState } from "react";

type Props = {
  role: LlmMessageRole;
  onSaveRole: (value: LlmMessageRole) => void;
  content: string;
  onSaveContent: (value: string) => void;
  selectedBlock: Block;
  spaceId: string;
  spaceContent: SpaceContent;
};

export default function EditorBlockLlmMessageConfigurations(props: Props) {
  const [role, setRole] = useState(props.role);
  const [content, setContent] = useState(props.content);

  return (
    <>
      <FieldRow>
        <FieldTitle>Role</FieldTitle>
        <RadioGroup
          orientation="horizontal"
          value={role}
          onChange={(e) => {
            const role = e.target.value as LlmMessageRole;
            setRole(role);
            props.onSaveRole(role);
          }}
        >
          <Radio
            size="sm"
            variant="outlined"
            name="role"
            value={LlmMessageRole.System}
            label="System"
          />
          <Radio
            size="sm"
            variant="outlined"
            name="role"
            value={LlmMessageRole.User}
            label="User"
          />
          <Radio
            size="sm"
            variant="outlined"
            name="role"
            value={LlmMessageRole.Assistant}
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
          value={content}
          onChange={(e) => {
            setContent(e.target.value);
          }}
          onKeyUp={(e) => {
            if (e.key === "Enter") {
              props.onSaveContent(content);
            }
          }}
          onBlur={() => props.onSaveContent(content)}
        />
      </FieldRow>
    </>
  );
}
