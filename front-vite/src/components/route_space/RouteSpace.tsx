import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import styled from "styled-components";
import u from "updeep";
import { useMutation, useQuery } from "urql";
import { execute } from "../../llm/chainExecutor";
import {
  SPACE_QUERY,
  UPDATE_SPACE_CONTENT_MUTATION,
} from "../../state/spaceGraphQl";
import { usePersistStore, useStore } from "../../state/zustand";
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

export default function RouteSpace() {
  const openAiApiKey = usePersistStore((state) => state.openAiApiKey);
  const setMissingOpenAiApiKey = useStore(
    (state) => state.setMissingOpenAiApiKey
  );

  // TODO: Properly handle spaceId not being present
  const { spaceId = "" } = useParams<{ spaceId: string }>();

  const spaceV2SelectedBlockId = useStore(
    (state) => state.spaceV2SelectedBlockId
  );
  const setSpaceV2SelectedBlockId = useStore(
    (state) => state.setSpaceV2SelectedBlockId
  );

  const [queryResult] = useQuery({
    query: SPACE_QUERY,
    variables: {
      spaceId: spaceId,
    },
  });

  const [spaceContent, setSpaceContent] = useState<SpaceContent | null>(null);

  // Sync up server data with local state
  useEffect(() => {
    if (queryResult.data?.result?.space.content) {
      setSpaceContent(JSON.parse(queryResult.data.result?.space.content));
    } else {
      setSpaceContent(null);
    }
  }, [queryResult.data?.result?.space.content]);

  const [, updateSpaceContent] = useMutation(UPDATE_SPACE_CONTENT_MUTATION);

  const [isExecuting, setIsExecuting] = useState(false);
  const [currentExecutingBlockId, setCurrentExecutingBlockId] = useState<
    string | null
  >(null);
  const [isCurrentExecutingBlockError, setIsCurrentExecutingBlockError] =
    useState(false);

  const onExecuteVisualChain = useCallback(() => {
    if (spaceContent == null) {
      console.error("spaceContent is null");
      return;
    }

    // TODO: Find a better way to do validation
    for (const block of Object.values(spaceContent.components)) {
      if (block.type === BlockType.Llm) {
        if (!openAiApiKey) {
          setSpaceV2SelectedBlockId(block.id);
          setMissingOpenAiApiKey(true);
          return;
        }
      }
    }

    // TODO: Make it actually validate someting
    validate(spaceContent);

    setIsCurrentExecutingBlockError(false);
    setIsExecuting(true);

    execute({
      spaceContent,
      onExecuteStart: (blockId) => {
        setCurrentExecutingBlockId(blockId);
      },
      onBlockUpdate: (block) => {
        setSpaceContent((state) => {
          // Must access current spaceContent state in setSpaceContent callback,
          // otherwise it will be stale.

          const newState = u({
            components: {
              [block.id]: u.constant(block),
            },
          })(state) as SpaceContent;

          updateSpaceContent({
            spaceId: spaceId,
            content: JSON.stringify(newState),
          });

          return newState;
        });
      },
    })
      .then(() => {
        setCurrentExecutingBlockId(null);
      })
      .catch(() => {
        setIsCurrentExecutingBlockError(true);
      })
      .finally(() => {
        setIsExecuting(false);
      });
  }, [
    spaceContent,
    openAiApiKey,
    spaceId,
    setMissingOpenAiApiKey,
    setSpaceV2SelectedBlockId,
    updateSpaceContent,
  ]);

  if (queryResult.fetching) {
    return <div>Loading...</div>;
  }

  if (queryResult.error) {
    return <div>Error! {queryResult.error.message}</div>;
  }

  if (!queryResult.data?.result) {
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
        spaceSubHeaderFragment={queryResult.data.result.space}
        isReadOnly={queryResult.data.result.isReadOnly}
        spaceId={spaceId}
        spaceContent={spaceContent}
        onSpaceContentChange={(spaceContent) => {
          setSpaceContent(spaceContent);
          updateSpaceContent({
            spaceId: spaceId,
            content: JSON.stringify(spaceContent),
          });
        }}
        onExecuteVisualChain={onExecuteVisualChain}
        isExecuting={isExecuting}
      />
      <Content>
        {spaceContent && (
          <>
            <Designer
              isReadOnly={queryResult.data.result.isReadOnly}
              spaceId={spaceId}
              spaceName={queryResult.data.result.space.name}
              spaceContent={spaceContent}
              isExecuting={isExecuting}
              currentExecutingBlockId={currentExecutingBlockId}
              isCurrentExecutingBlockError={isCurrentExecutingBlockError}
            />
            {selectedBlock && (
              <Editor
                // Must provide a key, otherwise it won't re-render when the
                // selected block changes
                key={selectedBlock.id}
                isReadOnly={queryResult.data.result.isReadOnly}
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
