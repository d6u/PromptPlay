import { useMutation, useQuery } from "@apollo/client";
import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useRecoilValue, useSetRecoilState } from "recoil";
import styled from "styled-components";
import u from "updeep";
import { execute } from "../../llm/chainExecutor";
import {
  SPACE_QUERY,
  UPDATE_SPACE_CONTENT_MUTATION,
} from "../../state/spaceGraphQl";
import {
  missingOpenAiApiKeyState,
  openAiApiKeyState,
  spaceV2SelectedBlockIdState,
} from "../../state/store";
import { Block, BlockType, SpaceContent } from "../../static/spaceTypes";
import { validate } from "../../static/spaceUtils";
import Designer from "./body/Designer";
import Editor from "./body/Editor";
import SpaceV2SubHeader from "./sub_header/SpaceV2SubHeader";

const Content = styled.div`
  flex-grow: 1;
  display: flex;
  padding: 0 0 0 20px;
  min-height: 0;
`;

type Props = {};

export default function RouteSpace(props: Props) {
  // TODO: Properly handle spaceId not being present
  const { spaceId = "" } = useParams<{ spaceId: string }>();

  const spaceV2SelectedBlockId = useRecoilValue(spaceV2SelectedBlockIdState);
  const openAiApiKey = useRecoilValue(openAiApiKeyState);
  const setMissingOpenAiApiKey = useSetRecoilState(missingOpenAiApiKeyState);
  const setSpaceV2SelectedBlockId = useSetRecoilState(
    spaceV2SelectedBlockIdState
  );

  const query = useQuery(SPACE_QUERY, {
    variables: {
      spaceId: spaceId,
    },
  });

  const [spaceContent, setSpaceContent] = useState<SpaceContent | null>(null);

  // Sync up server data with local state
  useEffect(() => {
    if (query.data?.result?.space.content) {
      setSpaceContent(JSON.parse(query.data.result?.space.content));
    } else {
      setSpaceContent(null);
    }
  }, [query.data?.result?.space.content]);

  const [updateSpaceContent] = useMutation(UPDATE_SPACE_CONTENT_MUTATION);

  const onExecuteVisualChain = useCallback(() => {
    if (spaceContent == null) {
      console.error("spaceContent is null");
      return;
    }

    // TODO: Find a better way to do validation
    for (const block of Object.values(spaceContent.components)) {
      if (block.type === BlockType.Llm) {
        if (openAiApiKey == null || openAiApiKey === "") {
          setSpaceV2SelectedBlockId(block.id);
          setMissingOpenAiApiKey(true);
          return;
        }
      }
    }

    // TODO: Make it actually validate someting
    validate(spaceContent);

    execute(spaceContent, openAiApiKey, (block) => {
      setSpaceContent((state) => {
        // Must access current spaceContent state in setSpaceContent callback,
        // otherwise it will be stale.

        const newState = u({
          components: {
            [block.id]: u.constant(block),
          },
        })(state) as SpaceContent;

        updateSpaceContent({
          variables: {
            spaceId: spaceId,
            content: JSON.stringify(newState),
          },
        });

        return newState;
      });
    });
  }, [
    spaceContent,
    openAiApiKey,
    spaceId,
    setMissingOpenAiApiKey,
    setSpaceV2SelectedBlockId,
    updateSpaceContent,
  ]);

  if (query.loading) {
    return <div>Loading...</div>;
  }

  if (query.error) {
    return <div>Error! {query.error.message}</div>;
  }

  if (!query.data?.result) {
    return <div>Could not find any data.</div>;
  }

  // TODO: Handle group as well
  const selectedBlock =
    spaceContent && spaceV2SelectedBlockId
      ? (spaceContent.components[spaceV2SelectedBlockId] as Block)
      : null;

  return (
    <>
      <SpaceV2SubHeader
        spaceSubHeaderFragment={query.data.result.space}
        isReadOnly={query.data.result.isReadOnly}
        spaceId={spaceId}
        spaceContent={spaceContent}
        onSpaceContentChange={(spaceContent) => {
          setSpaceContent(spaceContent);
          updateSpaceContent({
            variables: {
              spaceId: spaceId,
              content: JSON.stringify(spaceContent),
            },
          });
        }}
        onExecuteVisualChain={onExecuteVisualChain}
      />
      <Content>
        {spaceContent && (
          <>
            <Designer
              isReadOnly={query.data.result.isReadOnly}
              spaceId={spaceId}
              spaceName={query.data.result.space.name}
              spaceContent={spaceContent}
            />
            {selectedBlock && (
              <Editor
                // Must provide a key, otherwise it won't re-render when the
                // selected block changes
                key={selectedBlock.id}
                isReadOnly={query.data.result.isReadOnly}
                selectedBlock={selectedBlock}
                spaceId={spaceId}
                spaceContent={spaceContent}
              />
            )}
          </>
        )}
      </Content>
    </>
  );
}
