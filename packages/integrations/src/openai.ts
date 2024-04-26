import {
  Observable,
  ReadableStreamLike,
  buffer,
  filter,
  map,
  mergeMap,
  share,
  throwError,
  timeout,
} from 'rxjs';
import { fromFetch } from 'rxjs/fetch';

export const NEW_LINE_SYMBOL = '↵';

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

export type GetCompletionArguments = {
  apiKey: string;
  model: string;
  temperature: number;
  messages: ChatGPTMessage[];
  stop: string[];
  seed?: number | null;
  responseFormat?: { type: 'json_object' } | null;
};

export function getStreamingCompletion({
  apiKey,
  model,
  temperature,
  messages,
  stop,
  seed,
  responseFormat,
}: GetCompletionArguments): Observable<
  ChatCompletionStreamResponse | ChatCompletionErrorResponse
> {
  const fetchOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature,
      stop,
      stream: true,
      seed,
      response_format: responseFormat,
    }),
  };

  const dataObs = fromFetch(OPENAI_API_URL, {
    ...fetchOptions,
    selector(response) {
      // TODO: Will HTTP error status be reflected here as reponse.ok?

      if (response.body == null) {
        return throwError(() => new Error('response body is null'));
      }

      return response.body?.pipeThrough(
        new TextDecoderStream(),
      ) as ReadableStreamLike<string>;
    },
  }).pipe(share());

  const bufferSignal = dataObs.pipe(filter((chunk) => chunk.endsWith('\n')));

  return dataObs.pipe(
    // Buffer chunks until we get a new line, because when network is slow,
    // we might get partial chunks
    buffer(bufferSignal),
    // Filter out empty chunks, which could happy when observable complete,
    // but we have no more chunks.
    filter((chunks) => chunks.length > 0),
    map((chunks) => chunks.join('')),
    mergeMap((chunk) => parserStreamChunk(chunk)),
    map<string, ChatCompletionStreamResponse | ChatCompletionErrorResponse>(
      (content) => {
        try {
          return JSON.parse(content);
        } catch (error) {
          // TODO: Report error to telemetry
          console.error('Error parsing JSON', error);
          return {};
        }
      },
    ),
  );
}

export function getNonStreamingCompletion({
  apiKey,
  model,
  temperature,
  messages,
  stop,
  seed,
  responseFormat,
}: GetCompletionArguments): Observable<
  | { isError: false; data: ChatCompletionResponse }
  | { isError: true; data: ChatCompletionErrorResponse }
> {
  const fetchOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature,
      stop,
      seed,
      response_format: responseFormat,
    }),
  };

  return fromFetch(OPENAI_API_URL, {
    ...fetchOptions,
    selector: async (response) => {
      const data = await response.json();

      if (response.ok) {
        return { isError: false, data };
      }

      return { isError: true, data };
    },
  }).pipe(timeout(1000 * 60)); // 60s, TimeoutError
}

// Stream

export type ChatCompletionStreamResponse = ChatCompletionResponseCommon & {
  choices: Array<ChoiceStream>;
};

type ChoiceStream = ChoiceCommon & {
  delta: {
    role?: string;
    content?: string;
  };
  finish_reason: string | null;
  index: number;
};

// Non-stream

export type ChatCompletionResponse = ChatCompletionResponseCommon & {
  choices: Array<Choice>;
  usage: {
    prompt_token: number;
    completion_tokens: number;
    total_tokens: number;
  };
};

type Choice = ChoiceCommon & {
  message: ChatGPTMessage;
};

// Error

export type ChatCompletionErrorResponse = {
  error: {
    message: string;
    type: string;
    param: string | null;
    code: number | null;
  };
};

// Common

export type ChatGPTMessage = {
  role: string;
  content: string;
};

export enum ChatGPTMessageRole {
  system = 'system',
  user = 'user',
  assistant = 'assistant',
}

type ChoiceCommon = {
  finish_reason: string;
  index: number;
};

type ChatCompletionResponseCommon = {
  created: number;
  id: string;
  model: string;
  object: string;
};

// Utils

function parserStreamChunk(chunk: string): string[] {
  chunk = chunk.trim();

  if (!chunk.startsWith('data:')) {
    // Should be an JSON with error property here
    return [chunk];
  }

  return (
    chunk
      .split('\n')
      // Remove empty lines
      .filter((line) => line !== '')
      .map((line) => line.replace('data:', '').trim())
      // TODO: Explicitly handle [DONE] message
      .filter((line) => {
        return line && !line.includes('[DONE]');
      })
  );
}
