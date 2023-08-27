import {
  Block,
  LlmMessageRole,
  SpaceContent,
} from "../../../../static/spaceTypes";
import {
  FieldHelperText,
  FieldRow,
  FieldTitle,
} from "./editorCommonComponents";
import Checkbox from "@mui/joy/Checkbox";
import Input from "@mui/joy/Input";
import Radio from "@mui/joy/Radio";
import RadioGroup from "@mui/joy/RadioGroup";
import Textarea from "@mui/joy/Textarea";
import { useState } from "react";

type Props = {
  role: LlmMessageRole;
  onSaveRole: (value: LlmMessageRole) => void;
  content: string;
  onSaveContent: (value: string) => void;
  listNameToAppend: string;
  onSaveListNameToAppend: (listNameToAppend: string) => void;
  selectedBlock: Block;
  spaceId: string;
  spaceContent: SpaceContent;
};

export default function EditorBlockLlmMessageConfigurations(props: Props) {
  const [role, setRole] = useState(props.role);
  const [content, setContent] = useState(props.content);
  const [listNameToAppend, setListNameToAppend] = useState(
    props.listNameToAppend
  );

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
          minRows={5}
          placeholder="Enter your message here"
          value={content}
          onChange={(e) => {
            setContent(e.target.value);
          }}
          onKeyDown={(e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
              props.onSaveContent(content);
            }
          }}
          onBlur={() => props.onSaveContent(content)}
        />
        <FieldHelperText>
          Press <code>CMD</code> + <code>ENTER</code> () or <code>CTRL</code> +{" "}
          <code>ENTER</code> (Windows) to save. Unfocus will also save.
        </FieldHelperText>
      </FieldRow>
      <FieldRow>
        <FieldTitle>Append to list (optional)</FieldTitle>
        <Input
          color="neutral"
          size="sm"
          variant="outlined"
          placeholder="List name"
          value={listNameToAppend}
          onChange={(e) => setListNameToAppend(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              props.onSaveListNameToAppend(listNameToAppend);
            }
          }}
          onBlur={() => props.onSaveListNameToAppend(listNameToAppend)}
        />
      </FieldRow>
    </>
  );
}
