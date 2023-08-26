import { FragmentType, gql, useFragment } from "../../../__generated__";
import { SubHeaderBlockSetFragmentFragment } from "../../../__generated__/graphql";
import {
  LlmMesssage,
  OpenAiErrorResponse,
  OpenAiStreamResponse,
  getStreamingCompletion,
  parserStreamChunk,
} from "../../../llm/openai";
import {
  EditorElementType,
  cursorPointingBlockSetIdState,
  cursorPositionState,
  missingOpenAiApiKeyState,
  openAiApiKeyState,
  selectedBlockState,
  selectedElementTypeState,
  streamingBlockIdState,
  streamingOutputBlockContentState,
} from "../../../state/store";
import { ApolloClient, useApolloClient, useMutation } from "@apollo/client";
import Button from "@mui/joy/Button";
import { useCallback } from "react";
import { useRecoilValue, useSetRecoilState } from "recoil";
import {
  Observable,
  concatMap,
  filter,
  from,
  map,
  mergeMap,
  partition,
  reduce,
  share,
  tap,
} from "rxjs";

const RUN_BUTTON_FRAGMENT = gql(`
  fragment RunButtonFragment on Preset {
    blockSets {
      id
      topInputPromptBlock {
        id
        role
        content
      }
      systemPromptBlock {
        id
        content
      }
      completerBlock {
        id
        model
        temperature
        stop
      }
    }
  }
`);

const SUB_HEADER_BLOCK_SET_FRAGMENT = gql(`
  fragment SubHeaderBlockSetFragment on BlockSet {
    id
    position
    isInputIncludingPreviousBlockSetOutput
    isOutputIncludingInputBlocks
    isRepeatingCurrentBlockSet
    topInputPromptBlock {
      id
      role
      content
    }
    systemPromptBlock {
      id
      content
    }
    completerBlock {
      id
      model
      temperature
      stop
    }
    topOutputBlock {
      id
      content
    }
    previousBlockSetsInputBlocks {
      id
      role
      content
    }
  }
`);

const CREATE_TOP_OUTPUT_BLOCK_ON_BLOCK_SET_MUTATION = gql(`
  mutation CreateTopOutputBlockOnBlockSetMutation(
    $blockSetId: UUID!
  ) {
    createTopOutputBlockOnBlockSet(
      blockSetId: $blockSetId
    ) {
      id
      topOutputBlock {
        id
      }
    }
  }
`);

const UPDATE_PROMPT_BLOCK_MUTATION = gql(`
  mutation UpdatePromptBlockMutation(
    $id: UUID!
    $content: String!
  ) {
    updatePromptBlock(
      id: $id
      role: Assistant
      content: $content
    ) {
      id
    }
  }
`);

type Props = {
  runButtonFragment: FragmentType<typeof RUN_BUTTON_FRAGMENT>;
  onLoadingStart: () => void;
  onLoadingEnd: () => void;
};

export default function RunButton({
  runButtonFragment,
  onLoadingStart,
  onLoadingEnd,
}: Props) {
  // --- Global State ---

  const openAiApiKey = useRecoilValue(openAiApiKeyState);
  const setStreamingBlockId = useSetRecoilState(streamingBlockIdState);
  const setStreamingOutputBlockContent = useSetRecoilState(
    streamingOutputBlockContentState
  );
  const setCursorPosition = useSetRecoilState(cursorPositionState);
  const cursorPointingBlockSetId = useRecoilValue(
    cursorPointingBlockSetIdState
  );
  const setSelectedElementTypeState = useSetRecoilState(
    selectedElementTypeState
  );
  const setSelectedBlockState = useSetRecoilState(selectedBlockState);
  const setMissingOpenAiApiKey = useSetRecoilState(missingOpenAiApiKeyState);

  // --- GraphQL ---

  const preset = useFragment(RUN_BUTTON_FRAGMENT, runButtonFragment);
  const client = useApolloClient();
  const blockSet = getBlockSet(client, cursorPointingBlockSetId);

  // --- GraphQL Mutations ---

  const [createTopOutputBlockOnBlockSet] = useMutation(
    CREATE_TOP_OUTPUT_BLOCK_ON_BLOCK_SET_MUTATION,
    {
      refetchQueries: ["WorkspaceRouteQuery"],
    }
  );

  const [updatePromptBlock] = useMutation(UPDATE_PROMPT_BLOCK_MUTATION, {
    refetchQueries: ["WorkspaceRouteQuery"],
  });

  // --- React ---

  const onRunButtonClick = useCallback(() => {
    if (!blockSet?.completerBlock) {
      // TODO: Show in UI
      console.error("Must define a completer block");
      return;
    }

    if (!openAiApiKey) {
      console.error("Must specify the OpenAI API key");

      // Give user hint on how to resolve this
      setSelectedElementTypeState(EditorElementType.Completer);
      setSelectedBlockState(blockSet.completerBlock.id as string);
      setMissingOpenAiApiKey(true);
      return;
    }

    onLoadingStart();

    const messages: LlmMesssage[] = assembleMessages(blockSet);
    const model = blockSet.completerBlock.model;
    const temperature = blockSet.completerBlock.temperature;
    const stop = blockSet.completerBlock.stop
      ? [blockSet.completerBlock.stop]
      : [];

    const [contentObs, errorObs] = getCompletionObservable(
      openAiApiKey,
      model,
      temperature,
      stop,
      messages
    );

    let isReceivedFirstChunk = false;
    let topOutputBlockIdPromise: Promise<string> | null = null;

    contentObs
      .pipe(
        tap(() => {
          if (isReceivedFirstChunk) {
            return;
          }

          isReceivedFirstChunk = true;

          setStreamingOutputBlockContent(() => "");

          topOutputBlockIdPromise = createTopOutputBlockOnBlockSet({
            variables: {
              blockSetId: cursorPointingBlockSetId,
            },
          }).then(({ errors, data }) => {
            if (errors) {
              // TODO: Show in UI
              throw errors;
            }

            const id = data?.createTopOutputBlockOnBlockSet?.topOutputBlock
              ?.id as string | null;

            if (id == null) {
              // TODO: Show in UI
              throw new Error("Output was not created");
            }

            setStreamingBlockId(id);

            return id;
          });
        }),
        map((value) => value.choices[0]?.delta.content),
        filter((content): content is string => content != null),
        tap((content) => setStreamingOutputBlockContent((c) => c + content)),
        reduce((acc, value) => acc + value, "")
      )
      .subscribe({
        next: (content) => {
          if (!topOutputBlockIdPromise) {
            return;
          }

          topOutputBlockIdPromise
            .then((id) =>
              updatePromptBlock({
                variables: {
                  id,
                  content,
                },
              })
            )
            .then(({ errors }) => {
              onLoadingEnd();

              if (errors) {
                // TODO: Show in UI
                throw errors;
              }

              setStreamingBlockId(null);
              setStreamingOutputBlockContent("");
              setCursorPosition(
                (cursorPosition) =>
                  (cursorPosition + 1) % preset.blockSets.length
              );
            })
            .catch((error) => {
              // TODO: Show in UI
              console.error(
                "Something went wrong when saving the output",
                error
              );
            });
        },
        complete: () => {
          onLoadingEnd();

          if (!isReceivedFirstChunk) {
            // TODO: Show in UI
            console.error("did not receive first chunk");
            return;
          }
        },
        error: (error) => {
          onLoadingEnd();

          // TODO: Show in UI
          console.error(
            "Something went wrong while streaming responses from LLM",
            error
          );
        },
      });

    errorObs.subscribe((error) => {
      console.error("error", error);
    });
  }, [
    onLoadingEnd,
    onLoadingStart,
    openAiApiKey,
    blockSet,
    cursorPointingBlockSetId,
    setCursorPosition,
    updatePromptBlock,
    createTopOutputBlockOnBlockSet,
    setStreamingBlockId,
    setStreamingOutputBlockContent,
    preset,
    setMissingOpenAiApiKey,
    setSelectedBlockState,
    setSelectedElementTypeState,
  ]);

  return (
    <Button variant="solid" color="success" onClick={onRunButtonClick}>
      Run
    </Button>
  );
}

function getCompletionObservable(
  openAiApiKey: string,
  model: string,
  temperature: number,
  stop: string[],
  messages: LlmMesssage[]
) {
  const obs = from(
    getStreamingCompletion({
      apiKey: openAiApiKey,
      model,
      temperature,
      stop,
      messages,
    })
  ).pipe(
    map((response) => {
      if (response.body == null) {
        console.error("response.body is null");
        return;
      }

      const reader = response.body
        .pipeThrough(new TextDecoderStream())
        .getReader();

      return reader;
    }),
    filter((r): r is ReadableStreamDefaultReader<string> => r != null),
    mergeMap((reader) => convertReaderToObservable(reader)),
    concatMap((value) => parserStreamChunk(value)),
    map<string, OpenAiStreamResponse | OpenAiErrorResponse>((content) =>
      JSON.parse(content)
    ),
    share()
  );

  return partition<
    OpenAiStreamResponse | OpenAiErrorResponse,
    OpenAiStreamResponse
  >(obs, (value): value is OpenAiStreamResponse => !("error" in value));
}

function convertReaderToObservable(
  reader: ReadableStreamDefaultReader<string>
): Observable<string> {
  return new Observable<string>((subscriber) => {
    async function read() {
      while (true) {
        const { value, done } = await reader.read();
        if (value) {
          subscriber.next(value);
        }
        if (done) {
          return;
        }
      }
    }

    read()
      .then(() => {
        subscriber.complete();
      })
      .catch((error) => {
        subscriber.error(error);
      });
  });
}

function getBlockSet(
  client: ApolloClient<object>,
  cursorPointingBlockSetId: string | null
): SubHeaderBlockSetFragmentFragment | null {
  if (cursorPointingBlockSetId == null) {
    return null;
  }

  return client.readFragment({
    id: `BlockSet:${cursorPointingBlockSetId}`,
    fragment: SUB_HEADER_BLOCK_SET_FRAGMENT,
  });
}

function assembleMessages(blockSet: SubHeaderBlockSetFragmentFragment) {
  const messages: LlmMesssage[] = [];

  if (blockSet.systemPromptBlock != null) {
    messages.push({
      role: "system",
      content: blockSet.systemPromptBlock.content,
    });
  }

  if (blockSet.isInputIncludingPreviousBlockSetOutput) {
    for (const block of blockSet.previousBlockSetsInputBlocks) {
      messages.push({
        role: block.role.toLowerCase(),
        content: block.content,
      });
    }
  }

  if (blockSet.topInputPromptBlock != null) {
    messages.push({
      role: blockSet.topInputPromptBlock.role.toLowerCase(),
      content: blockSet.topInputPromptBlock.content,
    });
  }

  return messages;
}
