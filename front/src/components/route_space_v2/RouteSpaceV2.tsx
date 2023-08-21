import { gql } from "../../__generated__";
import VariableMapArrow from "../icons/VaribleMapArrow";
import "./RouteSpaceV2.css";
import { useMutation, useQuery } from "@apollo/client";
import { Button } from "@mui/joy";
import { ReactNode, useEffect, useState } from "react";

const SPACE_V2_QUERY = gql(`
  query SpaceV2Query($spaceId: UUID!) {
    spaceV2(id: $spaceId) {
      id
      name
      content
    }
  }
`);

const UPDATE_SPACE_V2_MUTATION = gql(`
  mutation UpdateSpaceV2Mutation($spaceId: UUID!, $content: String!) {
    updateSpaceV2(id: $spaceId, content: $content) {
      id
      name
      content
    }
  }
`);

type Block = {
  input: { [key: string]: string } | string | null;
  code: string | null;
  output: { [key: string]: string } | string | null;
};

type BlockGroup = {
  type: "root" | "repeat" | "alternative";
  blocks: Array<Block | BlockGroup>;
};

export default function RouteSpaceV2({ spaceId }: { spaceId: string }) {
  // --- Local State ---

  const [content, setContent] = useState<BlockGroup | null>(null);

  // --- GraphQL ---

  const query = useQuery(SPACE_V2_QUERY, {
    variables: {
      spaceId,
    },
  });

  const [updateSpaceV2] = useMutation(UPDATE_SPACE_V2_MUTATION);

  useEffect(() => {
    if (query.data?.spaceV2?.content) {
      setContent(JSON.parse(query.data.spaceV2.content));
    }
  }, [query.data?.spaceV2?.content]);

  if (query.loading) {
    return <div>Loading...</div>;
  }

  if (query.error) {
    return <div>Error! {query.error.message}</div>;
  }

  if (query.data == null) {
    return <div>Could not find any data.</div>;
  }

  return (
    <div className="RouteSpaceV2">
      <div className="RouteSpaceV2_left">
        <div>
          <h3>{query.data.spaceV2?.name}</h3>
          {query.data.spaceV2?.id}
        </div>
        <Button
          onClick={() => {
            let newContent: BlockGroup;
            if (content == null) {
              newContent = {
                type: "root",
                blocks: [],
              };
            } else {
              newContent = { ...content };
            }

            newContent.blocks.push({
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
                type: "root",
                blocks: [],
              };
            } else {
              newContent = { ...content };
            }

            newContent.blocks.push({
              type: "repeat",
              blocks: [
                {
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
      <div className="RouteSpaceV2_right">
        {content && <BlockGroupComponent blockGroup={content} />}
      </div>
    </div>
  );
}

function BlockGroupComponent({ blockGroup }: { blockGroup: BlockGroup }) {
  let title: string;
  switch (blockGroup.type) {
    case "root":
      title = "Root";
      break;
    case "repeat":
      title = "Repeat";
      break;
    case "alternative":
      title = "Alternative";
      break;
  }

  return (
    <div className="RouteSpaceV2_group">
      <div className="RouteSpaceV2_group_title">{title}</div>
      {blockGroup.blocks?.map((block, index) => {
        if (isBlockGroup(block)) {
          return <BlockGroupComponent key={index} blockGroup={block} />;
        } else {
          return <BlockComponent key={index} block={block} />;
        }
      })}
    </div>
  );
}

function BlockComponent({ block }: { block: Block }) {
  const inputChips: ReactNode[] = [];
  if (isObject(block.input)) {
    for (const [nameOnScope, argumentName] of Object.entries(block.input)) {
      (inputChips as ReactNode[]).push(
        <div
          key={`scope-name-${nameOnScope}`}
          className="RouteSpaceV2_block_variable_scope_name"
        >
          {nameOnScope}
        </div>,
        <VariableMapArrow
          key={`${nameOnScope}-${argumentName}-arrow`}
          className="RouteSpaceV2_block_arrow_icon"
        />,
        <div
          key={`argument-name-${argumentName}`}
          className="RouteSpaceV2_block_variable_argument_name"
        >
          {argumentName}
        </div>
      );
    }
  } else if (block.input) {
    inputChips.push(
      <div key="scope-name" className="RouteSpaceV2_block_variable_scope_name">
        {block.input}
      </div>,
      <VariableMapArrow
        key="arrow"
        className="RouteSpaceV2_block_arrow_icon"
      />,
      <div
        key="argument-name"
        className="RouteSpaceV2_block_variable_argument_name"
      >
        _
      </div>
    );
  }

  const outputChips: ReactNode[] = [];
  if (isObject(block.output)) {
    for (const [returnName, nameOnScope] of Object.entries(block.output)) {
      outputChips.push(
        <div
          key={`argument-name-${returnName}`}
          className="RouteSpaceV2_block_variable_argument_name"
        >
          {returnName}
        </div>,
        <VariableMapArrow
          key={`${returnName}-${nameOnScope}-arrow`}
          className="RouteSpaceV2_block_arrow_icon"
        />,
        <div
          key={`scope-name-${nameOnScope}`}
          className="RouteSpaceV2_block_variable_scope_name"
        >
          {nameOnScope}
        </div>
      );
    }
  } else if (block.output) {
    outputChips.push(
      <div
        key="argument-name"
        className="RouteSpaceV2_block_variable_argument_name"
      >
        _
      </div>,
      <VariableMapArrow
        key="arrow"
        className="RouteSpaceV2_block_arrow_icon"
      />,
      <div key="scope-name" className="RouteSpaceV2_block_variable_scope_name">
        {block.output}
      </div>
    );
  }

  return (
    <div className="RouteSpaceV2_block">
      <div className="RouteSpaceV2_block_input">{inputChips}</div>
      <div className="RouteSpaceV2_block_code">
        <pre>{block.code}</pre>
      </div>
      <div className="RouteSpaceV2_block_output">{outputChips}</div>
    </div>
  );
}

function isBlockGroup(block: Block | BlockGroup): block is BlockGroup {
  return "type" in block;
}

function isObject(
  value: { [key: string]: string } | string | null
): value is { [key: string]: string } {
  return typeof value === "object";
}
