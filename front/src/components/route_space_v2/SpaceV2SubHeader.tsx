import "./SpaceV2SubHeader.css";
import { UPDATE_SPACE_V2_MUTATION } from "./graphql";
import { BlockGroup } from "./utils";
import { useMutation } from "@apollo/client";
import Button from "@mui/joy/Button";
import { nanoid } from "nanoid";

export default function SpaceV2SubHeader({
  spaceId,
  content,
}: {
  spaceId: string;
  content: BlockGroup | null;
}) {
  const [updateSpaceV2] = useMutation(UPDATE_SPACE_V2_MUTATION);

  return (
    <div className="SpaceV2SubHeader">
      <div className="SpaceV2SubHeader_left">
        <Button
          onClick={() => {
            const newContent = {
              id: nanoid(),
              type: "root",
              blocks: [],
            };

            updateSpaceV2({
              variables: {
                spaceId,
                content: JSON.stringify(newContent),
              },
            });
          }}
        >
          reset
        </Button>
        <Button
          onClick={() => {
            let newContent: BlockGroup;
            if (content == null) {
              newContent = {
                id: nanoid(),
                type: "root",
                blocks: [],
              };
            } else {
              newContent = { ...content };
            }

            newContent.blocks.push({
              id: nanoid(),
              input: {
                scope_name: "argument_name",
              },
              code: `function(messages, message) {
return message + ' world';
}`,
              output: {
                return_name: "scope_name",
              },
            });

            updateSpaceV2({
              variables: {
                spaceId,
                content: JSON.stringify(newContent),
              },
            });
          }}
        >
          add block
        </Button>
        <Button
          onClick={() => {
            let newContent: BlockGroup;
            if (content == null) {
              newContent = {
                id: nanoid(),
                type: "root",
                blocks: [],
              };
            } else {
              newContent = { ...content };
            }

            newContent.blocks.push({
              id: nanoid(),
              type: "repeat",
              blocks: [
                {
                  id: nanoid(),
                  input: {
                    messages: "messages",
                    message: "message",
                  },
                  code: `function(messages, message) {
return message + ' world';
}`,
                  output: {
                    messages: "messages",
                    message: "message",
                  },
                },
              ],
            });

            updateSpaceV2({
              variables: {
                spaceId,
                content: JSON.stringify(newContent),
              },
            });
          }}
        >
          add group
        </Button>
      </div>
      <div>
        <Button
          variant="outlined"
          onClick={() => {
            const isConfirmed = window.confirm(
              "⚠️ Unrecoverable action. ⚠️\nDeleting this space is unrecoverable. Are you sure?"
            );
            if (isConfirmed) {
              // deleteSpace({
              //   variables: {
              //     workspaceId,
              //   },
              // }).then(({ errors, data }) => {
              //   if (errors || data?.deleteSpace?.isSuccess !== true) {
              //     console.error(errors);
              //     return;
              //   }
              //   setLocation("/");
              // });
            }
          }}
        >
          Delete space
        </Button>
      </div>
    </div>
  );
}
